import { TELEGRAM_API_URL } from './bot';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

/**
 * Download a file from Telegram and upload to Supabase Storage
 */
export async function downloadTelegramMedia(
  fileId: string,
  userId: string,
  type: 'image' | 'audio'
): Promise<{
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
} | null> {
  try {
    // 1. Get file path from Telegram
    const fileResponse = await fetch(`${TELEGRAM_API_URL}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    });
    const fileData = await fileResponse.json();

    if (!fileData.ok || !fileData.result?.file_path) {
      console.error('Failed to get Telegram file path:', fileData);
      return null;
    }

    const filePath: string = fileData.result.file_path;
    const fileSize: number = fileData.result.file_size || 0;

    // 2. Download the file
    const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
      console.error('Failed to download Telegram file');
      return null;
    }

    const buffer = Buffer.from(await downloadResponse.arrayBuffer());

    // 3. Determine mime type and extension
    const ext = filePath.split('.').pop() || (type === 'image' ? 'jpg' : 'ogg');
    const mimeType = type === 'image'
      ? `image/${ext === 'jpg' ? 'jpeg' : ext}`
      : `audio/${ext === 'oga' ? 'ogg' : ext}`;
    const filename = `telegram-${type}-${Date.now()}.${ext}`;

    // 4. Upload to Supabase Storage
    const storagePath = `${userId}/${filename}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('attachments')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Failed to upload to storage:', uploadError);
      return null;
    }

    return {
      url: storagePath,
      filename,
      size: fileSize || buffer.length,
      mimeType,
    };
  } catch (error) {
    console.error('Error downloading Telegram media:', error);
    return null;
  }
}
