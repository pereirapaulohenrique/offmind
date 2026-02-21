'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'attachments';
const SIGNED_URL_EXPIRY = 3600;

// Cache signed URLs to avoid re-fetching on every render
const urlCache = new Map<string, { url: string; expiresAt: number }>();

function isFullUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function useAttachmentUrl(path: string | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(() => {
    if (!path) return null;
    if (isFullUrl(path)) return path;
    const cached = urlCache.get(path);
    if (cached && cached.expiresAt > Date.now()) return cached.url;
    return null;
  });

  useEffect(() => {
    if (!path) return;
    if (isFullUrl(path)) {
      setSignedUrl(path);
      return;
    }

    const cached = urlCache.get(path);
    if (cached && cached.expiresAt > Date.now()) {
      setSignedUrl(cached.url);
      return;
    }

    const supabase = createClient();
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_EXPIRY)
      .then(({ data, error }: { data: { signedUrl: string } | null; error: unknown }) => {
        if (data?.signedUrl) {
          const expiresAt = Date.now() + (SIGNED_URL_EXPIRY - 60) * 1000;
          urlCache.set(path, { url: data.signedUrl, expiresAt });
          setSignedUrl(data.signedUrl);
        }
      });
  }, [path]);

  return signedUrl;
}

export async function resolveAttachmentUrl(path: string): Promise<string> {
  if (isFullUrl(path)) return path;

  const cached = urlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    throw error || new Error('Failed to create signed URL');
  }

  const expiresAt = Date.now() + (SIGNED_URL_EXPIRY - 60) * 1000;
  urlCache.set(path, { url: data.signedUrl, expiresAt });
  return data.signedUrl;
}
