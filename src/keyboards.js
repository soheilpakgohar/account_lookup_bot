// src/keyboards.js
const { t } = require('./i18n');

/**
 * Build copy-button keyboard in the user's language.
 * @param {object} row   Supabase account row
 * @param {string} lang  'en' | 'fa'
 */
function buildCopyKeyboard(row, lang) {
  const btn = t(lang || 'en').copyButtons;

  const fields = [
    { label: btn.code,     field: 'code',     value: row.code },
    { label: btn.account,  field: 'account',  value: row.account },
    { label: btn.password, field: 'password', value: row.password },
    { label: btn.birthday, field: 'birthday', value: row.birthday },
    { label: btn.phone,    field: 'phone',    value: row.phone },
  ];

  return {
    inline_keyboard: fields.map(({ label, field, value }) => {
      const raw  = `copy|${field}|${String(value)}`;
      const safe = raw.length <= 64 ? raw : `copy|${field}|${String(value).slice(0, 58 - field.length)}`;
      return [{ text: label, callback_data: safe }];
    }),
  };
}

module.exports = { buildCopyKeyboard };
