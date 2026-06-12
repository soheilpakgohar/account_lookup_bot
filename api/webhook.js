// api/webhook.js
// Vercel serverless function — receives Telegram updates via webhook.
//
// IMPORTANT: We do NOT use bot.processUpdate() + event emitters here.
// Vercel freezes the process the moment res.send() is called, which kills
// any in-flight async work (Supabase queries, sendMessage calls) that was
// fired via event emitters but not yet awaited.
//
// Instead we call the handler functions DIRECTLY and await them fully
// before sending the 200 response.

require('dotenv').config();

const TelegramBot            = require('node-telegram-bot-api');
const { config, assertConfig } = require('../src/config');
const { getAccountByCode }   = require('../src/supabase');
const { buildCopyKeyboard }  = require('../src/keyboards');
const { t, resolveLang, saveLang, languageKeyboard } = require('../src/i18n');

const SERIAL_CODE_REGEX = /^[A-Za-z0-9]{2,20}$/;

// ── Bot instance (reused across warm invocations) ─────────────────────────────
let bot = null;
function getBot() {
  if (!bot) bot = new TelegramBot(config.telegram.token, { polling: false });
  return bot;
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    assertConfig();
  } catch (err) {
    console.error('[webhook] Config error:', err.message);
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // Optional secret token verification
  if (config.telegram.webhookSecret) {
    const incoming = req.headers['x-telegram-bot-api-secret-token'];
    if (incoming !== config.telegram.webhookSecret) {
      console.warn('[webhook] Invalid secret token');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const update = req.body;
  if (!update || typeof update !== 'object') {
    return res.status(400).json({ error: 'Invalid update body' });
  }

  try {
    await handleUpdate(getBot(), update);
  } catch (err) {
    console.error('[webhook] Error handling update:', err.message);
  }

  // Always return 200 — even on error — so Telegram doesn't retry
  return res.status(200).json({ ok: true });
};

// ── Update router ─────────────────────────────────────────────────────────────
async function handleUpdate(bot, update) {

  // Callback query (inline button tap)
  if (update.callback_query) {
    return handleCallback(bot, update.callback_query);
  }

  // Regular message
  if (update.message) {
    return handleMessage(bot, update.message);
  }
}

// ── Message handler ───────────────────────────────────────────────────────────
async function handleMessage(bot, msg) {
  if (!msg.text) return;

  const chatId = msg.chat.id;
  const text   = msg.text.trim();

  // ── Commands ────────────────────────────────────────────────────────────────
  if (text === '/start' || text.startsWith('/start ')) {
    const firstName = msg.from?.first_name || '';
    const lang      = await resolveLang(chatId);
    if (!lang) {
      return bot.sendMessage(chatId, t('en').chooseLanguage, {
        parse_mode:   'Markdown',
        reply_markup: languageKeyboard,
      });
    }
    return bot.sendMessage(chatId, t(lang).welcome(firstName), {
      parse_mode: 'Markdown',
    });
  }

  if (text === '/help' || text.startsWith('/help ')) {
    const lang = await resolveLang(chatId) || 'en';
    return bot.sendMessage(chatId, t(lang).help, { parse_mode: 'Markdown' });
  }

  if (text === '/language' || text.startsWith('/language ')) {
    const lang = await resolveLang(chatId) || 'en';
    return bot.sendMessage(chatId, t(lang).languageMenu, {
      parse_mode:   'Markdown',
      reply_markup: languageKeyboard,
    });
  }

  // Ignore other commands
  if (text.startsWith('/')) return;

  // ── Serial code lookup ───────────────────────────────────────────────────────
  const lang    = await resolveLang(chatId);
  const strings = t(lang || 'en');

  // Language gate
  if (!lang) {
    return bot.sendMessage(chatId, strings.chooseLanguage, {
      parse_mode:   'Markdown',
      reply_markup: languageKeyboard,
    });
  }

  // Validate format
  if (!SERIAL_CODE_REGEX.test(text)) {
    return bot.sendMessage(chatId, strings.invalidCode, { parse_mode: 'Markdown' });
  }

  const code = text.toUpperCase();

  // Send searching message, look up, delete it, reply
  const searchingMsg = await bot.sendMessage(chatId, strings.searching(code), {
    parse_mode: 'Markdown',
  }).catch(() => null);

  let account;
  try {
    account = await getAccountByCode(code);
  } catch (err) {
    console.error('[lookup] Supabase error:', err.message);
    if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});
    return bot.sendMessage(chatId, strings.dbError, { parse_mode: 'Markdown' });
  }

  if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});

  if (!account) {
    return bot.sendMessage(chatId, strings.notFound(code), { parse_mode: 'Markdown' });
  }

  return bot.sendMessage(chatId, strings.accountFound(account), {
    parse_mode:   'Markdown',
    reply_markup: buildCopyKeyboard(account, lang),
  });
}

// ── Callback query handler ────────────────────────────────────────────────────
async function handleCallback(bot, query) {
  const { id, data, message, from } = query;
  const chatId    = message?.chat?.id;
  const firstName = from?.first_name || '';

  if (!data || !chatId) {
    return bot.answerCallbackQuery(id);
  }

  // ── Language selection ──────────────────────────────────────────────────────
  if (data.startsWith('setlang|')) {
    const lang = data.split('|')[1];
    try {
      await saveLang(chatId, lang);
    } catch (_) {
      return bot.answerCallbackQuery(id, { text: '⚠️ Unknown language.' });
    }

    const strings = t(lang);
    await bot.answerCallbackQuery(id, {
      text: strings.languageSet.replace(/\*/g, ''),
    });
    return bot.editMessageText(strings.welcome(firstName), {
      chat_id:    chatId,
      message_id: message.message_id,
      parse_mode: 'Markdown',
    }).catch(() =>
      bot.sendMessage(chatId, strings.welcome(firstName), { parse_mode: 'Markdown' })
    );
  }

  // ── Copy field ──────────────────────────────────────────────────────────────
  if (data.startsWith('copy|')) {
    const parts = data.split('|');
    if (parts.length < 3) {
      return bot.answerCallbackQuery(id, { text: '⚠️ Could not read this field.' });
    }

    const field   = parts[1];
    const value   = parts.slice(2).join('|');
    const lang    = await resolveLang(chatId) || 'en';
    const strings = t(lang);
    const label   = strings.fieldLabels[field] || field;

    await bot.answerCallbackQuery(id, {
      text: `${label}:\n${value}`,
      show_alert: false,
    });
    return bot.sendMessage(chatId, strings.copyMessage(label, value), {
      parse_mode:          'Markdown',
      reply_to_message_id: message.message_id,
    });
  }

  return bot.answerCallbackQuery(id);
}
