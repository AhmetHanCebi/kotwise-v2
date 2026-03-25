'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Post, PostInsert, PostWithDetails, PostComment, PostCommentInsert } from '@/lib/database.types';

export function usePosts(userId?: string) {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feed — posts from a city, sorted by recency
  const fetchFeed = useCallback(async (cityId: string, page = 1, limit = 20, countryCode?: string, hashtag?: string) => {
    setLoading(true);
    setError(null);

    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*),
          city:cities!posts_city_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (countryCode === '__ALL__') {
        // No city/country filter — show all posts
      } else if (countryCode) {
        // Filter by country via the city relation
        query = query.eq('city.country_code', countryCode);
      } else {
        // Default: filter by city
        query = query.eq('city_id', cityId);
      }

      if (hashtag) {
        query = query.contains('hashtags', [hashtag]);
      }

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        return;
      }

      // Fetch likes, comments, and user's own likes in parallel
      let likedPostIds: Set<string> = new Set();
      let commentCounts: Record<string, number> = {};
      let likeCounts: Record<string, number> = {};

      if (data?.length) {
        const postIds = data.map(p => p.id);

        const [userLikesRes, commentsRes, allLikesRes] = await Promise.all([
          userId
            ? supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds)
            : Promise.resolve({ data: [] }),
          supabase.from('post_comments').select('post_id').in('post_id', postIds),
          supabase.from('post_likes').select('post_id').in('post_id', postIds),
        ]);

        likedPostIds = new Set((userLikesRes.data ?? []).map(l => l.post_id));

        if (commentsRes.data) {
          for (const c of commentsRes.data) {
            commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
          }
        }

        if (allLikesRes.data) {
          for (const l of allLikesRes.data) {
            likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
          }
        }
      }

      const enriched = (data ?? []).map(p => ({
        ...p,
        comments: [],
        like_count: likeCounts[p.id] || p.like_count || 0,
        comment_count: commentCounts[p.id] || p.comment_count || 0,
        is_liked: likedPostIds.has(p.id),
      })) as unknown as PostWithDetails[];

      if (page === 1) {
        setPosts(enriched);
      } else {
        setPosts(prev => [...prev, ...enriched]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Single post with comments
  const getById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(*),
          city:cities!posts_city_id_fkey(*),
          comments:post_comments!post_comments_post_id_fkey(*, user:profiles!post_comments_user_id_fkey(*))
        `)
        .eq('id', id)
        .single();

      if (err) {
        setError(err.message);
        return null;
      }

      let isLiked = false;
      if (userId) {
        const { data: like } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', userId)
          .single();
        isLiked = !!like;
      }

      // Compute accurate counts from joined data
      const actualCommentCount = (data.comments ?? []).length;
      // Fetch actual like count
      const { count: actualLikeCount } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', id);

      const result = {
        ...data,
        comment_count: actualCommentCount || data.comment_count || 0,
        like_count: actualLikeCount ?? data.like_count ?? 0,
        is_liked: isLiked,
      } as unknown as PostWithDetails;
      setPost(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create post
  const create = useCallback(async (input: PostInsert) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('posts')
        .insert(input)
        .select()
        .single();

      if (err) {
        setError(err.message);
        return { error: err.message };
      }

      return { data: data as Post };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle like
  const toggleLike = useCallback(async (postId: string) => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const { data: existing } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabase.from('post_likes').delete().eq('id', existing.id);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p
        ));
        if (post?.id === postId) {
          setPost(prev => prev ? { ...prev, like_count: prev.like_count - 1, is_liked: false } : null);
        }
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p
        ));
        if (post?.id === postId) {
          setPost(prev => prev ? { ...prev, like_count: prev.like_count + 1, is_liked: true } : null);
        }
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [userId, post]);

  // Add comment
  const addComment = useCallback(async (input: PostCommentInsert) => {
    try {
      const { data, error: err } = await supabase
        .from('post_comments')
        .insert(input)
        .select('*, user:profiles!post_comments_user_id_fkey(*)')
        .single();

      if (err) return { error: err.message };

      // Update local state
      const newComment = data as unknown as PostComment & { user: PostWithDetails['user'] };
      if (post?.id === input.post_id) {
        setPost(prev => prev ? {
          ...prev,
          comment_count: prev.comment_count + 1,
          comments: [...prev.comments, newComment],
        } : null);
      }
      setPosts(prev => prev.map(p =>
        p.id === input.post_id ? { ...p, comment_count: p.comment_count + 1 } : p
      ));

      return { data: newComment };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return { error: message };
    }
  }, [post]);

  // Trending posts (highest engagement)
  const fetchTrending = useCallback(async (cityId?: string, limit = 10) => {
    setLoading(true);

    try {
      let query = supabase
        .from('posts')
        .select('*, user:profiles!posts_user_id_fkey(*), city:cities!posts_city_id_fkey(*)')
        .order('like_count', { ascending: false })
        .limit(limit);

      if (cityId) query = query.eq('city_id', cityId);

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        return [];
      }

      const items = (data ?? []).map(p => ({ ...p, comments: [], is_liked: false })) as unknown as PostWithDetails[];
      return items;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    post,
    loading,
    error,
    fetchFeed,
    getById,
    create,
    toggleLike,
    addComment,
    fetchTrending,
  };
}
