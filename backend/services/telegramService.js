const TelegramBot = require('node-telegram-bot-api');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

let bot = null;
let botReady = false;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || token === 'your_telegram_bot_token_here') {
    console.warn('Telegram bot token not configured. Notifications disabled.');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    botReady = true;

    bot.on('polling_error', (err) => {
      console.error('Telegram polling error:', err.message);
    });

    bot.on('error', (err) => {
      console.error('Telegram bot error:', err.message);
    });

    console.log('Telegram bot initialized in polling mode.');
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error.message);
    botReady = false;
  }
};

const sendWithRetry = async (chatId, text, options = {}) => {
  if (!bot || !botReady) {
    return { success: false, reason: 'Bot not initialized' };
  }

  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options,
      });
      return { success: true };
    } catch (error) {
      lastError = error;
      console.error(`Telegram send attempt ${attempt} failed:`, error.message);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  return { success: false, reason: lastError?.message || 'Unknown error' };
};

const sendBookingNotification = async (appointmentData, branchName, masterName) => {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!chatId || chatId === 'your_telegram_admin_chat_id_here') {
    return { success: false, reason: 'Admin chat ID not configured' };
  }

  const message = [
    '<b>🆕 New Booking — BizBook</b>',
    '',
    `<b>Client:</b> ${escapeHtml(appointmentData.clientName)}`,
    `<b>Phone:</b> ${escapeHtml(appointmentData.clientPhone)}`,
    `<b>Service:</b> ${escapeHtml(appointmentData.serviceName)}`,
    `<b>Price:</b> ${appointmentData.price} KGS`,
    `<b>Date:</b> ${appointmentData.date}`,
    `<b>Time:</b> ${appointmentData.time}`,
    `<b>Branch:</b> ${escapeHtml(branchName)}`,
    `<b>Address:</b> ${escapeHtml(appointmentData.branchAddress || 'N/A')}`,
    `<b>Master:</b> ${escapeHtml(masterName)}`,
    `<b>Status:</b> ${appointmentData.status || 'pending'}`,
  ].join('\n');

  return sendWithRetry(chatId, message);
};

const sendCancellationNotification = async (appointmentData) => {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!chatId || chatId === 'your_telegram_admin_chat_id_here') {
    return { success: false, reason: 'Admin chat ID not configured' };
  }

  const message = [
    '<b>❌ Booking Cancelled — BizBook</b>',
    '',
    `<b>Client:</b> ${escapeHtml(appointmentData.clientName)}`,
    `<b>Phone:</b> ${escapeHtml(appointmentData.clientPhone)}`,
    `<b>Service:</b> ${escapeHtml(appointmentData.serviceName)}`,
    `<b>Date:</b> ${appointmentData.date}`,
    `<b>Time:</b> ${appointmentData.time}`,
    `<b>Status:</b> cancelled`,
  ].join('\n');

  return sendWithRetry(chatId, message);
};

initBot();

module.exports = {
  sendBookingNotification,
  sendCancellationNotification,
};
