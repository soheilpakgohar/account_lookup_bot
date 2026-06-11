// src/config.js
require('dotenv').config();

const config = {
  telegram: {
    token:         process.env.BOT_TOKEN,
    webhookSecret: process.env.WEBHOOK_SECRET, // optional but recommended
  },
  supabase: {
    url:   process.env.SUPABASE_URL || 'https://npunqibllmhpvsikalkt.supabase.co/rest/v1',
    key:   process.env.SUPABASE_KEY,
    table: process.env.SUPABASE_TABLE || 'accounts',
  },
};

// Only validate at runtime (not during Vercel build)
function assertConfig() {
  const missing = [];
  if (!config.telegram.token) missing.push('BOT_TOKEN');
  if (!config.supabase.key)   missing.push('SUPABASE_KEY');

  if (missing.length > 0) {
    const msg = `Missing env vars: ${missing.join(', ')}`;
    console.error('❌', msg);
    throw new Error(msg);
  }
}

module.exports = { config, assertConfig };
