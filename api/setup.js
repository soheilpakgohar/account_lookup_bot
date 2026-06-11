// api/setup.js
// Visit  https://your-project.vercel.app/api/setup  once after deploying
// to register the webhook URL with Telegram and set the command list.
//
// After a successful setup, this endpoint becomes a no-op status page.

const fetch  = require('node-fetch');
const config = require('../src/config');

module.exports = async function handler(req, res) {
  const token       = config.telegram.token;
  const vercelUrl   = config.vercelUrl;
  const secret      = config.telegram.webhookSecret;

  const errors = [];
  if (!token)     errors.push('BOT_TOKEN is not set');
  if (!vercelUrl) errors.push('VERCEL_URL is not set');

  if (errors.length > 0) {
    return res.status(500).json({ ok: false, errors });
  }

  const webhookUrl = `${vercelUrl}/api/webhook`;

  const results = {};

  // ── 1. Register webhook ─────────────────────────────────────────────────────
  try {
    const params = new URLSearchParams({ url: webhookUrl });
    if (secret) params.set('secret_token', secret);
    // Drop any queued updates from the polling era
    params.set('drop_pending_updates', 'true');
    // Tell Telegram which update types we care about
    params.set('allowed_updates', JSON.stringify(['message', 'callback_query']));

    const r = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?${params}`
    );
    results.setWebhook = await r.json();
  } catch (err) {
    results.setWebhook = { ok: false, error: err.message };
  }

  // ── 2. Set command list ─────────────────────────────────────────────────────
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start',    description: 'Welcome / خوش آمدید' },
          { command: 'help',     description: 'Help / راهنما' },
          { command: 'language', description: 'Change language / تغییر زبان' },
        ],
      }),
    });
    results.setMyCommands = await r.json();
  } catch (err) {
    results.setMyCommands = { ok: false, error: err.message };
  }

  // ── 3. Get current webhook info ─────────────────────────────────────────────
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    results.webhookInfo = await r.json();
  } catch (err) {
    results.webhookInfo = { ok: false, error: err.message };
  }

  const allOk = results.setWebhook?.ok && results.setMyCommands?.ok;

  res.status(allOk ? 200 : 500).json({
    ok: allOk,
    webhookUrl,
    results,
    nextStep: allOk
      ? '✅ Done! Your bot is live. You can delete the /api/setup route if you like.'
      : '❌ Something failed — check the results above.',
  });
};
