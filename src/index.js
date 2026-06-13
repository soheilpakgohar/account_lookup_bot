// src/index.js
const TelegramBot = require('node-telegram-bot-api');
const config      = require('./config');

const { registerCommands }       = require('./handlers/commands');
const { registerCallbacks }      = require('./handlers/callbacks');
const { registerLookup }         = require('./handlers/lookup');

// ── Create bot ───────────────────────────────────────────────────────────────

const bot = new TelegramBot(config.telegram.token, {
  polling: config.telegram.polling,
});

// ── Register handlers (ORDER MATTERS: commands → callbacks → lookup) ─────────

registerCommands(bot);
registerCallbacks(bot);
registerLookup(bot);   // catch-all text handler must come last

// ── Set bot command list (shows in Telegram's "/" menu) ───────────────────────

bot.setMyCommands([
  { command: 'start',    description: 'Start / شروع' },
  { command: 'help',     description: 'Help / راهنما' },
  { command: 'language', description: 'Change language / تغییر زبان' },
]).catch(err => console.error('Could not set commands:', err.message));

// ── Global error handling ────────────────────────────────────────────────────

bot.on('polling_error', (err) => {
  if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
    console.error('❌  Conflict: another bot instance is already polling. Stop it first.');
  } else {
    console.error('❌  Polling error:', err.code, err.message);
  }
});

bot.on('error', (err) => console.error('❌  Bot error:', err.message));

process.on('uncaughtException',  (err) => console.error('💥  Uncaught exception:', err.message));
process.on('unhandledRejection', (reason) => console.error('💥  Unhandled rejection:', reason));

// ── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
  console.log(`\n🛑  ${signal} received — shutting down...`);
  await bot.stopPolling();
  console.log('✅  Bot stopped. Goodbye!');
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ── Startup banner ───────────────────────────────────────────────────────────

bot.getMe().then((info) => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   🔐  Account Lookup Bot  |  EN + FA     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Bot:  @${(info.username || '').padEnd(32)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('Languages: 🇬🇧 English  🇮🇷 فارسی');
  console.log('Waiting for messages...  (Ctrl+C to stop)\n');
}).catch((err) => {
  console.error('❌  Startup failed — check your BOT_TOKEN:', err.message);
  process.exit(1);
});
