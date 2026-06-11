// src/handlers/callbacks.js
const { t, resolveLang, saveLang, languageKeyboard } = require('../i18n');

function registerCallbacks(bot) {

  bot.on('callback_query', async (query) => {
    const { id, data, message, from } = query;
    const chatId    = message?.chat?.id;
    const firstName = from?.first_name || '';

    if (!data) { await bot.answerCallbackQuery(id); return; }

    // ── setlang|en  /  setlang|fa ─────────────────────────────────────────
    if (data.startsWith('setlang|')) {
      const lang = data.split('|')[1];

      try {
        await saveLang(chatId, lang);
      } catch (_) {
        await bot.answerCallbackQuery(id, { text: '⚠️ Unknown language.' });
        return;
      }

      const strings = t(lang);
      await bot.answerCallbackQuery(id, {
        text: strings.languageSet.replace(/\*/g, ''),
      });

      await bot.editMessageText(strings.welcome(firstName), {
        chat_id:    chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown',
      }).catch(() => {
        bot.sendMessage(chatId, strings.welcome(firstName), { parse_mode: 'Markdown' });
      });

      return;
    }

    // ── copy|<field>|<value> ───────────────────────────────────────────────
    if (data.startsWith('copy|')) {
      const parts = data.split('|');
      if (parts.length < 3) {
        await bot.answerCallbackQuery(id, { text: '⚠️ Could not read this field.' });
        return;
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

      await bot.sendMessage(chatId, strings.copyMessage(label, value), {
        parse_mode:          'Markdown',
        reply_to_message_id: message.message_id,
      });

      return;
    }

    await bot.answerCallbackQuery(id);
  });
}

module.exports = { registerCallbacks };
