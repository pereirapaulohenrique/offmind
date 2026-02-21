import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  sendTelegramMessage,
  TELEGRAM_WEBHOOK_SECRET,
  HELP_TEXT,
  WELCOME_TEXT,
} from '@/lib/telegram/bot';
import { downloadTelegramMedia } from '@/lib/telegram/media';
import type { Attachment } from '@/types/database';

// Use service role for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    caption?: string;
    photo?: Array<{ file_id: string; file_unique_id: string; width: number; height: number; file_size?: number }>;
    voice?: { file_id: string; file_unique_id: string; duration: number; file_size?: number; mime_type?: string };
  };
  callback_query?: {
    id: string;
    from: { id: number };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  };
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const headersList = await headers();
  const secretToken = headersList.get('x-telegram-bot-api-secret-token');

  if (TELEGRAM_WEBHOOK_SECRET && secretToken !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await request.json();

    // Handle callback queries (inline keyboard buttons)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message?.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const username = message.from.username;
    const firstName = message.from.first_name;
    const text = message.text?.trim() || '';
    const caption = message.caption?.trim() || '';

    // Check if user is connected
    const { data: connection } = await supabaseAdmin
      .from('telegram_connections')
      .select('*, profiles!inner(id)')
      .eq('telegram_user_id', userId)
      .eq('is_active', true)
      .single();

    // Handle photo messages
    if (message.photo && message.photo.length > 0) {
      if (!connection) {
        await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
        return NextResponse.json({ ok: true });
      }

      // Use the highest resolution photo
      const photo = message.photo[message.photo.length - 1];
      const media = await downloadTelegramMedia(photo.file_id, connection.user_id, 'image');

      if (media) {
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: 'image',
          url: media.url,
          filename: media.filename,
          size: media.size,
          created_at: new Date().toISOString(),
        };

        await captureItem(connection.user_id, caption || 'Photo capture', [attachment]);
        await sendTelegramMessage(chatId, '📸 Photo captured!');
      } else {
        await sendTelegramMessage(chatId, '❌ Failed to process photo. Please try again.');
      }

      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (message.voice) {
      if (!connection) {
        await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
        return NextResponse.json({ ok: true });
      }

      const media = await downloadTelegramMedia(message.voice.file_id, connection.user_id, 'audio');

      if (media) {
        const attachment: Attachment = {
          id: crypto.randomUUID(),
          type: 'audio',
          url: media.url,
          filename: media.filename,
          size: media.size,
          created_at: new Date().toISOString(),
          duration: message.voice.duration,
        };

        await captureItem(connection.user_id, caption || 'Voice capture', [attachment]);
        await sendTelegramMessage(chatId, `🎤 Voice note captured! (${message.voice.duration}s)`);
      } else {
        await sendTelegramMessage(chatId, '❌ Failed to process voice message. Please try again.');
      }

      return NextResponse.json({ ok: true });
    }

    // No text message
    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Handle commands
    if (text.startsWith('/')) {
      const [command, ...args] = text.split(' ');

      switch (command.toLowerCase()) {
        case '/start':
          await sendTelegramMessage(chatId, WELCOME_TEXT, { parseMode: 'HTML' });
          break;

        case '/help':
          await sendTelegramMessage(chatId, HELP_TEXT, { parseMode: 'HTML' });
          break;

        case '/connect': {
          const code = args[0]?.toUpperCase();
          if (!code || code.length !== 6) {
            await sendTelegramMessage(
              chatId,
              '⚠️ Please provide a valid 6-character connection code.\n\nUsage: /connect CODE',
              { parseMode: 'HTML' }
            );
            break;
          }

          const { data: pending } = await supabaseAdmin
            .from('profiles')
            .select('id, settings')
            .filter('settings->telegram_connection_code', 'eq', code)
            .single();

          if (!pending) {
            await sendTelegramMessage(
              chatId,
              '❌ Invalid or expired connection code. Please generate a new one in Settings.',
              { parseMode: 'HTML' }
            );
            break;
          }

          await supabaseAdmin.from('telegram_connections').upsert({
            user_id: pending.id,
            telegram_user_id: userId,
            telegram_username: username,
            telegram_first_name: firstName,
            is_active: true,
          } as any);

          const newSettings = { ...pending.settings };
          delete newSettings.telegram_connection_code;
          await supabaseAdmin
            .from('profiles')
            .update({ settings: newSettings } as any)
            .eq('id', pending.id);

          await sendTelegramMessage(
            chatId,
            '✅ <b>Connected!</b>\n\nYou can now send messages, photos, and voice notes to capture them instantly.',
            { parseMode: 'HTML' }
          );
          break;
        }

        case '/capture': {
          if (!connection) {
            await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
            break;
          }

          const captureText = args.join(' ');
          if (!captureText) {
            await sendTelegramMessage(chatId, '⚠️ Please provide text to capture.\n\nUsage: /capture Your thought here');
            break;
          }

          await captureItem(connection.user_id, captureText);
          await sendTelegramMessage(chatId, '📥 Captured!');
          break;
        }

        case '/inbox': {
          if (!connection) {
            await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
            break;
          }

          const { count } = await supabaseAdmin
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', connection.user_id)
            .eq('layer', 'capture')
            .is('archived_at', null);

          await sendTelegramMessage(
            chatId,
            `📥 You have <b>${count || 0}</b> item${count === 1 ? '' : 's'} in your inbox.`,
            { parseMode: 'HTML' }
          );
          break;
        }

        case '/today': {
          if (!connection) {
            await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
            break;
          }

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const { data: scheduled } = await supabaseAdmin
            .from('items')
            .select('title, scheduled_at, is_completed')
            .eq('user_id', connection.user_id)
            .gte('scheduled_at', today.toISOString())
            .lt('scheduled_at', tomorrow.toISOString())
            .is('archived_at', null)
            .order('scheduled_at');

          if (!scheduled || scheduled.length === 0) {
            await sendTelegramMessage(chatId, '📅 Nothing scheduled for today.');
            break;
          }

          let msg = '📅 <b>Today\'s Schedule</b>\n\n';
          for (const item of scheduled) {
            const time = item.scheduled_at
              ? new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';
            const checkmark = item.is_completed ? '✅' : '⬜';
            msg += `${checkmark} ${time ? `<b>${time}</b> - ` : ''}${item.title}\n`;
          }
          msg += `\n<i>${scheduled.filter(i => i.is_completed).length}/${scheduled.length} completed</i>`;

          await sendTelegramMessage(chatId, msg, { parseMode: 'HTML' });
          break;
        }

        case '/done': {
          if (!connection) {
            await sendTelegramMessage(chatId, '⚠️ Please connect your account first using /connect CODE');
            break;
          }

          // Get today's incomplete items as inline keyboard
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);

          const { data: incomplete } = await supabaseAdmin
            .from('items')
            .select('id, title')
            .eq('user_id', connection.user_id)
            .eq('is_completed', false)
            .is('archived_at', null)
            .or(`scheduled_at.gte.${todayStart.toISOString()},layer.eq.capture`)
            .order('scheduled_at', { ascending: true, nullsFirst: false })
            .limit(10);

          if (!incomplete || incomplete.length === 0) {
            await sendTelegramMessage(chatId, '🎉 All done for today!');
            break;
          }

          const keyboard = incomplete.map((item) => ([{
            text: `✓ ${item.title.slice(0, 40)}${item.title.length > 40 ? '...' : ''}`,
            callback_data: `done:${item.id}`,
          }]));

          await sendTelegramMessage(
            chatId,
            '☑️ <b>Mark as done:</b>',
            {
              parseMode: 'HTML',
              replyMarkup: { inline_keyboard: keyboard },
            }
          );
          break;
        }

        default:
          await sendTelegramMessage(chatId, 'Unknown command. Use /help to see available commands.');
      }
    } else {
      // Quick capture - any text message
      if (!connection) {
        await sendTelegramMessage(
          chatId,
          '⚠️ Please connect your account first.\n\nUse /connect CODE with your connection code from Settings.',
        );
        return NextResponse.json({ ok: true });
      }

      await captureItem(connection.user_id, text);
      await sendTelegramMessage(chatId, '📥 Captured!');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function captureItem(
  userId: string,
  title: string,
  attachments?: Attachment[],
  target?: { project_id?: string; space_id?: string; page_id?: string }
) {
  // Generate title from text
  const words = title.split(/\s+/);
  const isLong = words.length > 8;
  const displayTitle = isLong ? words.slice(0, 8).join(' ') + '...' : title;

  await supabaseAdmin.from('items').insert({
    user_id: userId,
    title: displayTitle,
    notes: title,
    layer: 'capture',
    source: 'telegram',
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
    ...(target?.project_id ? { project_id: target.project_id } : {}),
    ...(target?.space_id ? { space_id: target.space_id } : {}),
    ...(target?.page_id ? { page_id: target.page_id } : {}),
  } as any);
}

async function handleCallbackQuery(query: {
  id: string;
  from: { id: number };
  message?: { chat: { id: number }; message_id: number };
  data?: string;
}) {
  const data = query.data || '';
  const chatId = query.message?.chat.id;

  if (!chatId) return;

  // Handle "done:" callback
  if (data.startsWith('done:')) {
    const itemId = data.slice(5);

    // Find user connection
    const { data: connection } = await supabaseAdmin
      .from('telegram_connections')
      .select('user_id')
      .eq('telegram_user_id', query.from.id)
      .eq('is_active', true)
      .single();

    if (!connection) return;

    const { data: item, error } = await supabaseAdmin
      .from('items')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', itemId)
      .eq('user_id', connection.user_id)
      .select('title')
      .single();

    if (!error && item) {
      await sendTelegramMessage(chatId, `✅ <b>${item.title}</b> marked as done!`, { parseMode: 'HTML' });
    }

    // Answer callback to remove loading state
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: query.id }),
    });
  }
}
