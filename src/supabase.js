// src/supabase.js
// Lightweight Supabase REST client — no SDK needed.

const fetch  = require('node-fetch');
const config = require('./config');

const { url, key, table } = config.supabase;

/**
 * Look up an account by its serial code (case-insensitive).
 *
 * Expects a Supabase table with columns:
 *   code, account, password, birthday, phone
 *
 * @param {string} serialCode  e.g. 'AF66'
 * @returns {object|null}  The account row, or null if not found.
 * @throws  On network / server errors.
 */
async function getAccountByCode(serialCode) {
  // Supabase PostgREST: ilike for case-insensitive match
  const endpoint = `${url}/${table}?code=ilike.${encodeURIComponent(serialCode.trim())}&limit=1`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey':        key,
      'Authorization': `Bearer ${key}`,
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase error ${res.status}: ${body}`);
  }

  const rows = await res.json();
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { getAccountByCode };
