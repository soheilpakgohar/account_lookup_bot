// src/dev.js
// Local development only — uses polling so you don't need a public URL.
// Run with:  npm run dev
// DO NOT deploy this file to Vercel.

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { config, assertConfig } = require('./config');

assertConfig();

const { registerCommands }  = require('./handlers/commands');
const { registerCallbacks } = require('./handlers/callbacks');
const { registerLookup }    = require('./handlers/lookup');

const bot = new TelegramBot(config.telegram.token, {
  polling: { interval: 1000, autoStart: true, params: { timeout: 10 } },
});

registerCommands(bot);
registerCallbacks(bot);
registerLookup(bot);

bot.setMyCommands([
  { command: 'start',    description: 'Start / شروع' },
  { command: 'help',     description: 'Help / راهنما' },
  { command: 'language', description: 'Change language / تغییر زبان' },
]).catch(() => {});

bot.on('polling_error', (err) => console.error('❌ Polling:', err.message));
bot.on('error',         (err) => console.error('❌ Error:',   err.message));

process.on('SIGINT', async () => {
  await bot.stopPolling();
  console.log('\n✅ Dev bot stopped.');
  process.exit(0);
});

bot.getMe().then(info => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🛠️   DEV MODE  (polling)               ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Bot:  @${(info.username||'').padEnd(32)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('Ctrl+C to stop\n');
});
