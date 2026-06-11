#!/usr/bin/env node
// scripts/set-webhook.js
// Run after deploying to Vercel to register (or delete) the webhook.
//
// Usage:
//   node scripts/set-webhook.js                 → set webhook
//   node scripts/set-webhook.js --delete        → remove webhook
//
// Requires BOT_TOKEN and VERCEL_URL in .env

require('dotenv').config();

const fetch  = require('node-fetch');
const DELETE = process.argv.includes('--delete');

const BOT_TOKEN      = process.env.BOT_TOKEN;
const VERCEL_URL     = process.env.VERCEL_URL;          // e.g. https://my-bot.vercel.app
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

if (!BOT_TOKEN) { console.error('❌  BOT_TOKEN is not set in .env'); process.exit(1); }

const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function run() {
  if (DELETE) {
    console.log('🗑️  Deleting webhook...');
    const res  = await fetch(`${API}/deleteWebhook`);
    const data = await res.json();
    if (data.ok) console.log('✅  Webhook deleted. Bot will not receive updates.');
    else         console.error('❌  Failed:', data.description);
    return;
  }

  if (!VERCEL_URL) {
    console.error('❌  VERCEL_URL is not set in .env');
    console.error('    Example: VERCEL_URL=https://my-bot.vercel.app');
    process.exit(1);
  }

  const webhookUrl = `${VERCEL_URL.replace(/\/$/, '')}/api/webhook`;
  console.log(`🔗  Setting webhook to: ${webhookUrl}`);

  const body = { url: webhookUrl };
  if (WEBHOOK_SECRET) {
    body.secret_token = WEBHOOK_SECRET;
    console.log('🔒  Secret token: enabled');
  }

  const res  = await fetch(`${API}/setWebhook`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json();

  if (data.ok) {
    console.log('✅  Webhook set successfully!');

    // Verify
    const info = await (await fetch(`${API}/getWebhookInfo`)).json();
    console.log('');
    console.log('📋  Webhook info:');
    console.log(`    URL:              ${info.result.url}`);
    console.log(`    Pending updates:  ${info.result.pending_update_count}`);
    console.log(`    Secret token:     ${info.result.has_custom_certificate ? 'yes' : 'no (standard)'}`);
    console.log(`    Last error:       ${info.result.last_error_message || 'none'}`);
  } else {
    console.error('❌  Failed to set webhook:', data.description);
  }
}

run().catch(err => { console.error('💥', err.message); process.exit(1); });
