// src/bot.js
// Creates and configures the bot instance for webhook mode.
// This module is required by api/webhook.js (Vercel) and src/dev.js (local polling).

const TelegramBot = require('node-telegram-bot-api');
const { config }  = require('./config');

const { registerCommands }  = require('./handlers/commands');
const { registerCallbacks } = require('./handlers/callbacks');
const { registerLookup }    = require('./handlers/lookup');

let _bot = null;

/**
 * Returns a singleton bot instance configured for webhook mode.
 * Handlers are registered once on first call.
 */
function getBot() {
  if (_bot) return _bot;

  // webhook: true → no polling, bot just processes updates fed to it manually
  _bot = new TelegramBot(config.telegram.token, { webHook: false });

  registerCommands(_bot);
  registerCallbacks(_bot);
  registerLookup(_bot);

  // Register Telegram command list (runs once on cold start)
  _bot.setMyCommands([
    { command: 'start',    description: 'Welcome / خوش آمدید' },
    { command: 'help',     description: 'Help / راهنما' },
    { command: 'language', description: 'Change language / تغییر زبان' },
  ]).catch(err => console.error('[setMyCommands]', err.message));

  _bot.on('error', err => console.error('[bot error]', err.message));

  return _bot;
}

module.exports = { getBot };
