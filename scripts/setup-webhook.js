// scripts/setup-webhook.js
// Alternative: run locally with `npm run setup-webhook`
// Useful if you prefer the terminal over visiting a URL.

require('dotenv').config();
const fetch = require('node-fetch');

const token     = process.env.BOT_TOKEN;
const vercelUrl = process.env.VERCEL_URL;
const secret    = process.env.WEBHOOK_SECRET;

if (!token || !vercelUrl) {
  console.error('❌  BOT_TOKEN and VERCEL_URL must be set in .env');
  process.exit(1);
}

const webhookUrl = `${vercelUrl}/api/webhook`;

async function run() {
  console.log(`\n🔗 Registering webhook: ${webhookUrl}\n`);

  const params = new URLSearchParams({
    url: webhookUrl,
    drop_pending_updates: 'true',
    allowed_updates: JSON.stringify(['message', 'callback_query']),
  });
  if (secret) params.set('secret_token', secret);

  const r1 = await fetch(`https://api.telegram.org/bot${token}/setWebhook?${params}`);
  const j1 = await r1.json();
  console.log('setWebhook:', j1.ok ? '✅ OK' : `❌ ${j1.description}`);

  const r2 = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        { command: 'start',    description: 'Start / شروع' },
        { command: 'help',     description: 'Help / راهنما' },
        { command: 'language', description: 'Change language / تغییر زبان' },
      ],
    }),
  });
  const j2 = await r2.json();
  console.log('setMyCommands:', j2.ok ? '✅ OK' : `❌ ${j2.description}`);

  const r3 = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const j3 = await r3.json();
  console.log('\n📡 Webhook info:');
  console.log('  URL:            ', j3.result?.url);
  console.log('  Pending updates:', j3.result?.pending_update_count);
  console.log('  Last error:     ', j3.result?.last_error_message || 'none');
  console.log('');

  if (j1.ok && j2.ok) {
    console.log('✅  Setup complete! Your bot is live.\n');
  } else {
    console.log('❌  Setup had errors — see above.\n');
    process.exit(1);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
