// src/i18n.js
// Language system — Supabase-backed for stateless serverless environments.
//
// Each Vercel function invocation is isolated (no shared memory), so
// language preferences are stored in the `user_prefs` Supabase table
// and fetched at the start of each webhook call.

const en = require('./lang/en');
const fa = require('./lang/fa');
const { getUserLang, setUserLang } = require('./supabase');

const SUPPORTED    = { en, fa };
const DEFAULT_LANG = 'en';

/**
 * Get the language strings for a given chat.
 * Pass the already-resolved lang code from resolveLang().
 * @param {'en'|'fa'} lang
 * @returns {object}
 */
function t(lang) {
  return SUPPORTED[lang] || SUPPORTED[DEFAULT_LANG];
}

/**
 * Resolve a user's language from Supabase.
 * Call this once per webhook invocation and pass the result to t().
 * @param {number} chatId
 * @returns {Promise<'en'|'fa'>}
 */
async function resolveLang(chatId) {
  try {
    const lang = await getUserLang(chatId);
    return (lang && SUPPORTED[lang]) ? lang : null; // null = not set yet
  } catch (_) {
    return DEFAULT_LANG;
  }
}

/**
 * Save a user's language preference to Supabase.
 * @param {number} chatId
 * @param {'en'|'fa'} lang
 */
async function saveLang(chatId, lang) {
  if (!SUPPORTED[lang]) throw new Error(`Unsupported language: ${lang}`);
  await setUserLang(chatId, lang);
}

// ── Language picker keyboard ──────────────────────────────────────────────────
const languageKeyboard = {
  inline_keyboard: [[
    { text: '🇬🇧  English', callback_data: 'setlang|en' },
    { text: '🇮🇷  فارسی',   callback_data: 'setlang|fa' },
  ]],
};

module.exports = { t, resolveLang, saveLang, languageKeyboard, DEFAULT_LANG, SUPPORTED };
