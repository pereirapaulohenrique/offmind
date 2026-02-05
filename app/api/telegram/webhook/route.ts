import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  sendTelegramMessage,
  TELEGRAM_WEBHOOK_SECRET,
  HELP_TEXT,
  WELCOME_TEXT,
} from '@/lib/telegram/bot';

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
    const message = update.message;

    if (!message?.text || !message.from) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const username = message.from.username;
    const firstName = message.from.first_name;
    const text = message.text.trim();

    // Check if user is connected
    const { data: connection } = await supabaseAdmin
      .from('telegram_connections')
      .select('*, profiles!inner(id)')
      .eq('telegram_user_id', userId)
      .eq('is_active', true)
      .single();

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

          // Look up pending connection by code
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

          // Create connection
          await supabaseAdmin.from('telegram_connections').upsert({
            user_id: pending.id,
            telegram_user_id: userId,
            telegram_username: username,
            telegram_first_name: firstName,
            is_active: true,
          } as any);

          // Clear the connection code
          const newSettings = { ...pending.settings };
          delete newSettings.telegram_connection_code;
          await supabaseAdmin
            .from('profiles')
            .update({ settings: newSettings } as any)
            .eq('id', pending.id);

          await sendTelegramMessage(
            chatId,
            '✅ <b>Connected!</b>\n\nYou can now send messages to capture them instantly.',
            { parseMode: 'HTML' }
          );
          break;
        }

        case '/capture': {
          if (!connection) {
            await sendTelegramMessage(
              chatId,
              '⚠️ Please connect your account first using /connect CODE',
              { parseMode: 'HTML' }
            );
            break;
          }

          const captureText = args.join(' ');
          if (!captureText) {
            await sendTelegramMessage(
              chatId,
              '⚠️ Please provide text to capture.\n\nUsage: /capture Your thought here',
              { parseMode: 'HTML' }
            );
            break;
          }

          await captureItem(connection.user_id, captureText);
          await sendTelegramMessage(chatId, '📥 Captured!', { parseMode: 'HTML' });
          break;
        }

        case '/inbox': {
          if (!connection) {
            await sendTelegramMessage(
              chatId,
              '⚠️ Please connect your account first using /connect CODE',
              { parseMode: 'HTML' }
            );
            break;
          }

          const { count } = await supabaseAdmin
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', connection.user_id)
            .eq('layer', 'capture');

          await sendTelegramMessage(
            chatId,
            `📥 You have <b>${count || 0}</b> item${count === 1 ? '' : 's'} in your inbox.`,
            { parseMode: 'HTML' }
          );
          break;
        }

        default:
          await sendTelegramMessage(
            chatId,
            'Unknown command. Use /help to see available commands.',
            { parseMode: 'HTML' }
          );
      }
    } else {
      // Quick capture - any text message
      if (!connection) {
        await sendTelegramMessage(
          chatId,
          '⚠️ Please connect your account first.\n\nUse /connect CODE with your connection code from Settings.',
          { parseMode: 'HTML' }
        );
        return NextResponse.json({ ok: true });
      }

      await captureItem(connection.user_id, text);
      await sendTelegramMessage(chatId, '📥 Captured!');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function captureItem(userId: string, title: string) {
  await supabaseAdmin.from('items').insert({
    user_id: userId,
    title,
    layer: 'capture',
    source: 'telegram',
  } as any);
}
