// src/handlers/lookup.js
const { getAccountByCode } = require('../supabase');
const { buildCopyKeyboard } = require('../keyboards');
const { t, hasLanguage, languageKeyboard } = require('../i18n');

// Serial code: letters and numbers only, 2–20 characters
const SERIAL_CODE_REGEX = /^[A-Za-z0-9]{2,20}$/;

/**
 * Registers the plain-text message handler:
 *  1. If user has no language set, prompt them first
 *  2. Validate serial code format
 *  3. Query Supabase
 *  4. Reply with account details + per-field copy buttons (in their language)
 *
 * @param {TelegramBot} bot
 */
function registerLookup(bot) {

  bot.on('message', async (msg) => {
    // Ignore non-text and commands
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId = msg.chat.id;
    const input  = msg.text.trim();
    const strings = t(chatId);

    // ── Language gate: if user hasn't picked a language yet, ask first ────────
    if (!hasLanguage(chatId)) {
      return bot.sendMessage(chatId, strings.chooseLanguage, {
        parse_mode:   'Markdown',
        reply_markup: languageKeyboard,
      });
    }

    // ── Validate format ───────────────────────────────────────────────────────
    if (!SERIAL_CODE_REGEX.test(input)) {
      return bot.sendMessage(chatId, strings.invalidCode, {
        parse_mode: 'Markdown',
      });
    }

    const code = input.toUpperCase();

    // ── Send a "searching" placeholder ────────────────────────────────────────
    let searchingMsg;
    try {
      searchingMsg = await bot.sendMessage(chatId, strings.searching(code), {
        parse_mode: 'Markdown',
      });
    } catch (_) {}

    // ── Query Supabase ────────────────────────────────────────────────────────
    let account;
    try {
      account = await getAccountByCode(code);
    } catch (err) {
      console.error(`[Supabase error] code=${code}`, err.message);
      if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});

      return bot.sendMessage(chatId, strings.dbError, {
        parse_mode: 'Markdown',
      });
    }

    // ── Delete searching placeholder ──────────────────────────────────────────
    if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!account) {
      return bot.sendMessage(chatId, strings.notFound(code), {
        parse_mode: 'Markdown',
      });
    }

    // ── Success: send details with language-aware copy keyboard ───────────────
    await bot.sendMessage(chatId, strings.accountFound(account), {
      parse_mode:   'Markdown',
      reply_markup: buildCopyKeyboard(account, chatId),
    });
  });
}

module.exports = { registerLookup };
