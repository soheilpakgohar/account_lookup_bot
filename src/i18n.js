// src/i18n.js
// Language system:
//   • Supported: 'en' (English), 'fa' (Farsi/Persian)
//   • User preferences stored in memory (Map) — persists for the bot's lifetime.
//   • For permanent storage across restarts, swap the Map for a simple JSON file
//     or a Supabase `user_prefs` table (see comment at the bottom).

const en = require('./lang/en');
const fa = require('./lang/fa');

const SUPPORTED = { en, fa };
const DEFAULT_LANG = 'en';

// In-memory store:  chatId (number) → 'en' | 'fa'
const userLangs = new Map();

/**
 * Get the language strings for a given chat.
 * @param {number} chatId
 * @returns {object}  The full strings object for the user's language.
 */
function t(chatId) {
  const lang = userLangs.get(chatId) || DEFAULT_LANG;
  return SUPPORTED[lang] || SUPPORTED[DEFAULT_LANG];
}

/**
 * Set and persist a user's language preference.
 * @param {number} chatId
 * @param {'en'|'fa'} lang
 */
function setLang(chatId, lang) {
  if (!SUPPORTED[lang]) throw new Error(`Unsupported language: ${lang}`);
  userLangs.set(chatId, lang);
}

/**
 * Get the current language code for a chat.
 * @param {number} chatId
 * @returns {'en'|'fa'}
 */
function getLang(chatId) {
  return userLangs.get(chatId) || DEFAULT_LANG;
}

/**
 * Returns true if the user has already picked a language.
 * @param {number} chatId
 */
function hasLanguage(chatId) {
  return userLangs.has(chatId);
}

// ── Language picker keyboard ──────────────────────────────────────────────────
const languageKeyboard = {
  inline_keyboard: [[
    { text: '🇬🇧  English',  callback_data: 'setlang|en' },
    { text: '🇮🇷  فارسی',    callback_data: 'setlang|fa' },
  ]],
};

module.exports = { t, setLang, getLang, hasLanguage, languageKeyboard, SUPPORTED };

/* ─── OPTIONAL: Persistent storage ──────────────────────────────────────────
   To survive bot restarts, replace the in-memory Map with file-based storage:

   const fs   = require('fs');
   const PATH = './user_langs.json';
   let store  = {};
   try { store = JSON.parse(fs.readFileSync(PATH, 'utf8')); } catch (_) {}

   function setLang(chatId, lang) {
     store[chatId] = lang;
     fs.writeFileSync(PATH, JSON.stringify(store));
   }
   function getLang(chatId)    { return store[chatId] || DEFAULT_LANG; }
   function hasLanguage(chatId){ return !!store[chatId]; }
   function t(chatId)          { return SUPPORTED[getLang(chatId)]; }
─────────────────────────────────────────────────────────────────────────── */
