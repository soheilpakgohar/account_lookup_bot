// src/handlers/commands.js
const { t, resolveLang, languageKeyboard } = require('../i18n');

function registerCommands(bot) {

  // /start
  bot.onText(/\/start/, async (msg) => {
    const chatId    = msg.chat.id;
    const firstName = msg.from?.first_name || '';
    const lang      = await resolveLang(chatId);

    if (!lang) {
      // First visit — show language picker
      return bot.sendMessage(chatId, t('en').chooseLanguage, {
        parse_mode:   'Markdown',
        reply_markup: languageKeyboard,
      });
    }

    bot.sendMessage(chatId, t(lang).welcome(firstName), {
      parse_mode: 'Markdown',
    });
  });

  // /help
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const lang   = await resolveLang(chatId) || 'en';
    bot.sendMessage(chatId, t(lang).help, { parse_mode: 'Markdown' });
  });

  // /language — switch language at any time
  bot.onText(/\/language/, async (msg) => {
    const chatId = msg.chat.id;
    const lang   = await resolveLang(chatId) || 'en';
    bot.sendMessage(chatId, t(lang).languageMenu, {
      parse_mode:   'Markdown',
      reply_markup: languageKeyboard,
    });
  });
}

module.exports = { registerCommands };
