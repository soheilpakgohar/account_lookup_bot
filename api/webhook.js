// api/webhook.js
// Vercel serverless function — receives Telegram updates via webhook.
//
// Telegram sends a POST request to this URL for every message/callback.
// We feed the update body directly into the bot's processUpdate() method.

const { assertConfig } = require('../src/config');
const { getBot }       = require('../src/bot');

module.exports = async function handler(req, res) {

  // ── Only accept POST ───────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── Validate config on first cold start ───────────────────────────────────
  try {
    assertConfig();
  } catch (err) {
    console.error('[webhook] Config error:', err.message);
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  // ── Optional: verify Telegram secret token header ─────────────────────────
  // Set WEBHOOK_SECRET in Vercel env vars and in set-webhook.js for security.
  const { config } = require('../src/config');
  if (config.telegram.webhookSecret) {
    const incoming = req.headers['x-telegram-bot-api-secret-token'];
    if (incoming !== config.telegram.webhookSecret) {
      console.warn('[webhook] Invalid secret token — request rejected');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // ── Process the update ────────────────────────────────────────────────────
  try {
    const bot    = getBot();
    const update = req.body;

    if (!update || typeof update !== 'object') {
      return res.status(400).json({ error: 'Invalid update body' });
    }

    // processUpdate is synchronous for event emitting;
    // we await a micro-tick so async handlers (like our Supabase calls) start.
    await bot.processUpdate(update);

    // Respond 200 immediately — Telegram requires a fast response.
    // Any remaining async work (Supabase queries, sendMessage calls) continues.
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[webhook] Unhandled error:', err.message);
    // Still return 200 so Telegram doesn't retry and flood the function
    return res.status(200).json({ ok: false, error: err.message });
  }
};
