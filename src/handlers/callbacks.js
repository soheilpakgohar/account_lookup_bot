// src/handlers/callbacks.js
// Handles:
//   1. setlang|<code>  — language selection buttons
//   2. copy|<field>|<value> — copy field buttons

const { t, setLang, hasLanguage, languageKeyboard } = require('../i18n');

/**
 * Registers all callback_query handlers.
 * @param {TelegramBot} bot
 */
function registerCallbacks(bot) {

  bot.on('callback_query', async (query) => {
    const { id, data, message, from } = query;
    const chatId    = message?.chat?.id;
    const firstName = from?.first_name || '';

    if (!data) {
      await bot.answerCallbackQuery(id);
      return;
    }

    // ── Language selection: setlang|en  or  setlang|fa ───────────────────────
    if (data.startsWith('setlang|')) {
      const lang = data.split('|')[1];

      try {
        setLang(chatId, lang);
      } catch (_) {
        await bot.answerCallbackQuery(id, { text: '⚠️ Unknown language.' });
        return;
      }

      const strings = t(chatId);

      // Confirm in the chosen language
      await bot.answerCallbackQuery(id, { text: strings.languageSet.replace(/\*/g, '') });

      // Edit the language-picker message into a welcome message
      await bot.editMessageText(strings.welcome(firstName), {
        chat_id:    chatId,
        message_id: message.message_id,
        parse_mode: 'Markdown',
      }).catch(() => {
        // If edit fails (e.g. message too old), send a new one
        bot.sendMessage(chatId, strings.welcome(firstName), { parse_mode: 'Markdown' });
      });

      return;
    }

    // ── Copy field: copy|<field>|<value> ─────────────────────────────────────
    if (data.startsWith('copy|')) {
      const parts = data.split('|');
      if (parts.length < 3) {
        await bot.answerCallbackQuery(id, { text: '⚠️ Could not read this field.' });
        return;
      }

      const field = parts[1];
      const value = parts.slice(2).join('|'); // value may contain '|'
      const strings = t(chatId);
      const label   = strings.fieldLabels[field] || field;

      // 1. Toast popup (visible ~2s, long-pressable to copy on Android)
      await bot.answerCallbackQuery(id, {
        text: `${label}:\n${value}`,
        show_alert: false,
      });

      // 2. Send standalone monospace message — tap the `block` to copy on iOS/Android
      await bot.sendMessage(
        chatId,
        strings.copyMessage(label, value),
        {
          parse_mode:          'Markdown',
          reply_to_message_id: message.message_id,
        }
      );

      return;
    }

    // Unhandled callback — just dismiss the spinner
    await bot.answerCallbackQuery(id);
  });
}

module.exports = { registerCallbacks };
