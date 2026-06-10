// src/config.js
require('dotenv').config();

const config = {
  telegram: {
    token: process.env.BOT_TOKEN,
    polling: {
      interval: 1000,
      autoStart: true,
      params: { timeout: 10 },
    },
  },
  supabase: {
    url:   process.env.SUPABASE_URL   || 'https://npunqibllmhpvsikalkt.supabase.co/rest/v1',
    key:   process.env.SUPABASE_KEY,
    table: process.env.SUPABASE_TABLE || 'accounts',
  },
};

// ── Startup validation ────────────────────────────────────────────────────────

const missing = [];
if (!config.telegram.token)  missing.push('BOT_TOKEN');
if (!config.supabase.key)    missing.push('SUPABASE_KEY');

if (missing.length > 0) {
  console.error('');
  console.error('❌  Missing required environment variables:');
  missing.forEach(v => console.error(`    • ${v}`));
  console.error('');
  console.error('👉  Copy .env.example → .env and fill in the values.');
  console.error('');
  process.exit(1);
}

module.exports = config;
