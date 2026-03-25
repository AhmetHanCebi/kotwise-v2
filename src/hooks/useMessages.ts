'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Conversation, ConversationWithDetails, Message, MessageInsert, Profile } from '@/lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ConversationWithUnread extends ConversationWithDetails {
  has_unread: boolean;
}

export function useMessages(userId?: string) {
  const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [userId])
        .order('last_message_at', { ascending: false });

      if (err) {
        setError(err.message);
        return;
      }

      // Enrich with participant profiles
      const convs = data as Conversation[];
      const allParticipantIds = [...new Set(convs.flatMap(c => c.participant_ids))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', allParticipantIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));

      // Check unread status for each conversation
      const convIds = convs.map(c => c.id);
      let unreadConvIds = new Set<string>();
      if (convIds.length > 0) {
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .neq('sender_id', userId)
          .eq('is_read', false);

        if (unreadMessages) {
          unreadConvIds = new Set(unreadMessages.map(m => m.conversation_id));
        }
      }

      const enriched: ConversationWithUnread[] = convs.map(c => ({
        ...c,
        participants: c.participant_ids.map(id => profileMap.get(id)).filter(Boolean) as ConversationWithDetails['participants'],
        listing: null,
        has_unread: unreadConvIds.has(c.id),
      }));

      setConversations(enriched);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    setActiveConversation(conversationId);

    try {
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (err) {
        setError(err.message);
        return;
      }

      setMessages((data ?? []) as Message[]);

      // Mark unread messages as read
      if (userId) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', userId)
          .eq('is_read', false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Send message
  const send = useCallback(async (input: Omit<MessageInsert, 'sender_id'> & { sender_id?: string }) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { data, error: err } = await supabase
        .from('messages')
        .insert({ ...input, sender_id: input.sender_id ?? userId })
        .select()
        .single();

      if (err) return { error: err.message };
      return { data: data as Message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId]);

  // Create conversation
  const createConversation = useCallback(async (
    participantIds: string[],
    options?: { listing_id?: string; city_id?: string; is_group?: boolean; group_name?: string }
  ) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const ids = [...new Set([userId, ...participantIds])];

      // Check if 1:1 conversation already exists
      if (!options?.is_group && ids.length === 2) {
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .contains('participant_ids', ids)
          .eq('is_group', false);

        const found = (existing ?? []).find(c =>
          c.participant_ids.length === 2 &&
          ids.every(id => c.participant_ids.includes(id))
        );

        if (found) return { data: found as Conversation };
      }

      const { data, error: err } = await supabase
        .from('conversations')
        .insert({
          participant_ids: ids,
          listing_id: options?.listing_id,
          city_id: options?.city_id,
          is_group: options?.is_group ?? false,
          group_name: options?.group_name,
        })
        .select()
        .single();

      if (err) return { error: err.message };
      return { data: data as Conversation };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId]);

  // Realtime subscription for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    channelRef.current = supabase
      .channel(`messages:${activeConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversation}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);

          // Mark as read if from another user
          if (userId && newMessage.sender_id !== userId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeConversation, userId]);

  // Realtime for conversation list updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  // Mark all unread messages in a conversation as read
  const markConversationRead = useCallback(async (conversationId: string) => {
    if (!userId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    // Update local state
    setConversations(prev =>
      prev.map(c =>
        c.id === conversationId ? { ...c, has_unread: false } : c
      )
    );
  }, [userId]);

  const searchProfiles = useCallback(async (query: string) => {
    if (!userId || !query.trim()) return [];

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,university.ilike.%${query}%`)
        .limit(20);

      return (data ?? []) as Profile[];
    } catch (err) {
      console.error('Profil arama hatası:', err);
      return [];
    }
  }, [userId]);

  const fetchRecentContacts = useCallback(async () => {
    if (!userId) return [];

    try {
      const { data } = await supabase
        .from('conversations')
        .select('participant_ids')
        .contains('participant_ids', [userId])
        .order('last_message_at', { ascending: false })
        .limit(10);

      if (!data) return [];

      const ids = [...new Set(data.flatMap((c) => c.participant_ids))].filter(
        (id) => id !== userId
      );
      if (ids.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids)
        .limit(10);

      return (profiles ?? []) as Profile[];
    } catch (err) {
      console.error('Son iletişimler yüklenemedi:', err);
      return [];
    }
  }, [userId]);

  return {
    conversations,
    messages,
    activeConversation,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    send,
    createConversation,
    markConversationRead,
    searchProfiles,
    fetchRecentContacts,
  };
}
