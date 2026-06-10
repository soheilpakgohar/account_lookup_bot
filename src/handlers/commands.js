// src/handlers/commands.js
const { t, setLang, hasLanguage, languageKeyboard } = require('../i18n');

/**
 * Registers /start, /help, and /language command handlers.
 * @param {TelegramBot} bot
 */
function registerCommands(bot) {

  // /start — show language picker if first time, else show welcome
  bot.onText(/\/start/, async (msg) => {
    const chatId    = msg.chat.id;
    const firstName = msg.from?.first_name || '';

    if (!hasLanguage(chatId)) {
      // First visit — ask them to pick a language
      return bot.sendMessage(chatId, t(chatId).chooseLanguage, {
        parse_mode:   'Markdown',
        reply_markup: languageKeyboard,
      });
    }

    bot.sendMessage(chatId, t(chatId).welcome(firstName), {
      parse_mode: 'Markdown',
    });
  });

  // /help
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, t(msg.chat.id).help, {
      parse_mode: 'Markdown',
    });
  });

  // /language — lets user switch language at any time
  bot.onText(/\/language/, (msg) => {
    bot.sendMessage(msg.chat.id, t(msg.chat.id).languageMenu, {
      parse_mode:   'Markdown',
      reply_markup: languageKeyboard,
    });
  });
}

module.exports = { registerCommands };
