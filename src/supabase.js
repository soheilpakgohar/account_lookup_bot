// src/supabase.js
// Supabase REST client — accounts lookup + user language preferences.

const fetch  = require('node-fetch');
const { config } = require('./config');

function headers() {
  return {
    'apikey':        config.supabase.key,
    'Authorization': `Bearer ${config.supabase.key}`,
    'Content-Type':  'application/json',
    'Accept':        'application/json',
  };
}

function base() {
  return config.supabase.url.replace(/\/$/, '');
}

// ── Accounts ──────────────────────────────────────────────────────────────────

/**
 * Look up an account by serial code (case-insensitive).
 * @param {string} serialCode
 * @returns {object|null}
 */
async function getAccountByCode(serialCode) {
  const url = `${base()}/${config.supabase.table}?code=ilike.${encodeURIComponent(serialCode.trim())}&limit=1`;
  const res = await fetch(url, { method: 'GET', headers: headers() });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase ${res.status}: ${body}`);
  }

  const rows = await res.json();
  return rows.length > 0 ? rows[0] : null;
}

// ── User language preferences ─────────────────────────────────────────────────
// Stored in a `user_prefs` table:
//   chatId  bigint  primary key
//   lang    text    ('en' | 'fa')

/**
 * Get a user's saved language, or null if not set.
 * @param {number} chatId
 * @returns {'en'|'fa'|null}
 */
async function getUserLang(chatId) {
  const url = `${base()}/user_prefs?chat_id=eq.${chatId}&select=lang&limit=1`;
  const res = await fetch(url, { method: 'GET', headers: headers() });

  if (!res.ok) return null; // table may not exist yet — fail silently

  const rows = await res.json();
  return rows.length > 0 ? rows[0].lang : null;
}

/**
 * Upsert a user's language preference.
 * @param {number} chatId
 * @param {'en'|'fa'} lang
 */
async function setUserLang(chatId, lang) {
  const url = `${base()}/user_prefs`;
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      ...headers(),
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ chat_id: chatId, lang }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[setUserLang] Supabase ${res.status}: ${body}`);
    // Non-fatal — bot continues even if pref wasn't saved
  }
}

module.exports = { getAccountByCode, getUserLang, setUserLang };
