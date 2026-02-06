// Telegram Bot Configuration
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

export const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Send a message to a Telegram user
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: {
    parseMode?: 'HTML' | 'MarkdownV2';
    replyMarkup?: any;
  }
) {
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode,
      reply_markup: options?.replyMarkup,
    }),
  });

  return response.json();
}

// Set webhook URL
export async function setTelegramWebhook(url: string) {
  const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      secret_token: TELEGRAM_WEBHOOK_SECRET,
    }),
  });

  return response.json();
}

// Generate a connection code (6-digit alphanumeric)
export function generateConnectionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Bot commands
export const BOT_COMMANDS = {
  start: '/start',
  connect: '/connect',
  capture: '/capture',
  inbox: '/inbox',
  help: '/help',
};

// Help text
export const HELP_TEXT = `
🧠 <b>OffMind Bot</b>

<b>Commands:</b>
/start - Start the bot
/connect CODE - Connect your account
/capture TEXT - Capture a new item
/inbox - View your inbox count
/help - Show this help

<b>Quick Capture:</b>
Just send any message to capture it instantly!
`.trim();

// Welcome text for new users
export const WELCOME_TEXT = `
👋 <b>Welcome to OffMind!</b>

To connect your account:
1. Go to Settings in OffMind
2. Click "Connect Telegram"
3. Send /connect CODE with your connection code

Or just start sending messages to capture them!
`.trim();
