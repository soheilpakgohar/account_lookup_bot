// src/handlers/lookup.js
const { getAccountByCode }           = require('../supabase');
const { buildCopyKeyboard }          = require('../keyboards');
const { t, resolveLang, languageKeyboard } = require('../i18n');

const SERIAL_CODE_REGEX = /^[A-Za-z0-9]{2,20}$/;

function registerLookup(bot) {

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;

    const chatId  = msg.chat.id;
    const input   = msg.text.trim();
    const lang    = await resolveLang(chatId);
    const strings = t(lang || 'en');

    // ── Language gate ─────────────────────────────────────────────────────
    if (!lang) {
      return bot.sendMessage(chatId, strings.chooseLanguage, {
        parse_mode:   'Markdown',
        reply_markup: languageKeyboard,
      });
    }

    // ── Validate format ───────────────────────────────────────────────────
    if (!SERIAL_CODE_REGEX.test(input)) {
      return bot.sendMessage(chatId, strings.invalidCode, {
        parse_mode: 'Markdown',
      });
    }

    const code = input.toUpperCase();

    // ── Searching placeholder ─────────────────────────────────────────────
    let searchingMsg;
    try {
      searchingMsg = await bot.sendMessage(chatId, strings.searching(code), {
        parse_mode: 'Markdown',
      });
    } catch (_) {}

    // ── Query Supabase ────────────────────────────────────────────────────
    let account;
    try {
      account = await getAccountByCode(code);
    } catch (err) {
      console.error(`[lookup] code=${code}`, err.message);
      if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});
      return bot.sendMessage(chatId, strings.dbError, { parse_mode: 'Markdown' });
    }

    if (searchingMsg) bot.deleteMessage(chatId, searchingMsg.message_id).catch(() => {});

    // ── Not found ─────────────────────────────────────────────────────────
    if (!account) {
      return bot.sendMessage(chatId, strings.notFound(code), {
        parse_mode: 'Markdown',
      });
    }

    // ── Success ───────────────────────────────────────────────────────────
    await bot.sendMessage(chatId, strings.accountFound(account), {
      parse_mode:   'Markdown',
      reply_markup: buildCopyKeyboard(account, lang),
    });
  });
}

module.exports = { registerLookup };
