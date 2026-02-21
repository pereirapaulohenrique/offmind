import { createClient } from '@/lib/supabase/client';
import type { Attachment } from '@/types/database';

const BUCKET = 'attachments';
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export async function uploadAttachment(
  file: File,
  userId: string
): Promise<Attachment> {
  const supabase = createClient();
  const id = crypto.randomUUID();
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/${id}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const type: 'image' | 'audio' = file.type.startsWith('audio/') ? 'audio' : 'image';

  return {
    id,
    type,
    url: path,
    filename: file.name,
    size: file.size,
    created_at: new Date().toISOString(),
  };
}

export async function deleteAttachment(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}

export async function getAttachmentUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    throw error || new Error('Failed to create signed URL');
  }

  return data.signedUrl;
}
