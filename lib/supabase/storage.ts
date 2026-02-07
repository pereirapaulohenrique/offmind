import { createClient } from '@/lib/supabase/client';
import type { Attachment } from '@/types/database';

const BUCKET = 'attachments';

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

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  const type: 'image' | 'audio' = file.type.startsWith('audio/') ? 'audio' : 'image';

  return {
    id,
    type,
    url: urlData.publicUrl,
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

export function getAttachmentUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}
