// src/bot.js
// Used by src/dev.js (local polling) only.
// The Vercel webhook (api/webhook.js) does NOT use this file —
// it handles updates directly to avoid event-emitter async issues.

const TelegramBot = require('node-telegram-bot-api');
const { config }  = require('./config');

const { registerCommands }  = require('./handlers/commands');
const { registerCallbacks } = require('./handlers/callbacks');
const { registerLookup }    = require('./handlers/lookup');

let _bot = null;

function getBot() {
  if (_bot) return _bot;
  _bot = new TelegramBot(config.telegram.token, { polling: false });
  registerCommands(_bot);
  registerCallbacks(_bot);
  registerLookup(_bot);
  _bot.on('error', err => console.error('[bot error]', err.message));
  return _bot;
}

module.exports = { getBot };
