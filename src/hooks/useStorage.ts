'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

type BucketName = 'avatars' | 'listings' | 'posts' | 'messages' | 'documents';

interface UploadResult {
  url: string;
  path: string;
}

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File, bucket: BucketName): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`;
    }

    const allowedTypes = bucket === 'documents' ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Accepted: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, []);

  const upload = useCallback(async (
    file: File,
    bucket: BucketName,
    userId: string,
    customPath?: string
  ): Promise<{ data?: UploadResult; error?: string }> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    // Validate
    const validationError = validateFile(file, bucket);
    if (validationError) {
      setError(validationError);
      setUploading(false);
      return { error: validationError };
    }

    // Generate path
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const path = customPath ?? `${userId}/${timestamp}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return { error: uploadError.message };
      }

      setProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setUploading(false);
      return { data: { url: publicUrl, path } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      setUploading(false);
      return { error: message };
    }
  }, [validateFile]);

  const uploadMultiple = useCallback(async (
    files: File[],
    bucket: BucketName,
    userId: string
  ): Promise<{ data?: UploadResult[]; error?: string }> => {
    setUploading(true);
    setError(null);

    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await upload(files[i], bucket, userId);
      if (result.error) {
        setUploading(false);
        return { error: `Failed to upload file ${i + 1}: ${result.error}` };
      }
      if (result.data) results.push(result.data);
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    return { data: results };
  }, [upload]);

  const remove = useCallback(async (bucket: BucketName, path: string) => {
    const { error: err } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (err) return { error: err.message };
    return {};
  }, []);

  return {
    upload,
    uploadMultiple,
    remove,
    uploading,
    progress,
    error,
  };
}
