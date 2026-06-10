// src/keyboards.js
// Builds the inline keyboard with a "Copy" button for every account detail.
// Labels are now language-aware via the i18n system.

const { t } = require('./i18n');

/**
 * Returns an inline keyboard with per-field copy buttons, in the user's language.
 * @param {object} row     Account row from Supabase
 * @param {number} chatId  Used to pick the right language
 */
function buildCopyKeyboard(row, chatId) {
  const strings = t(chatId);
  const btn = strings.copyButtons;

  const fields = [
    { label: btn.code,     field: 'code',     value: row.code },
    { label: btn.account,  field: 'account',  value: row.account },
    { label: btn.password, field: 'password', value: row.password },
    { label: btn.birthday, field: 'birthday', value: row.birthday },
    { label: btn.phone,    field: 'phone',    value: row.phone },
  ];

  const keyboard = fields.map(({ label, field, value }) => {
    const callbackData = `copy|${field}|${String(value)}`;
    // Telegram hard limit: 64 bytes for callback_data
    const safe = callbackData.length <= 64
      ? callbackData
      : `copy|${field}|${String(value).slice(0, 64 - field.length - 6)}`;

    return [{ text: label, callback_data: safe }];
  });

  return { inline_keyboard: keyboard };
}

module.exports = { buildCopyKeyboard };
