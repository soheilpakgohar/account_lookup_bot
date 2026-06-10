// src/lang/en.js — English strings

module.exports = {
  // ── Language picker ───────────────────────────────────────────────────────
  chooseLanguage:
    `🌐 *Please choose your language:*\n\n` +
    `لطفاً زبان خود را انتخاب کنید:`,

  languageSet: `✅ Language set to *English*. Welcome!`,

  // ── /start ────────────────────────────────────────────────────────────────
  welcome: (firstName) =>
    `👋 *Welcome, ${firstName}!*\n\n` +
    `I'm your *Account Lookup Bot*. 🔐\n\n` +
    `I can instantly retrieve your account details using the *serial code* you received from us.\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *How to use:*\n` +
    `Simply send your serial code — for example:\n\n` +
    `      \`AF66\`\n\n` +
    `And I'll fetch your full account details right away.\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `Need help? Type /help anytime. ✨`,

  // ── /help ─────────────────────────────────────────────────────────────────
  help:
    `📖 *Help & Instructions*\n\n` +
    `*How to get your account details:*\n` +
    `1️⃣  Send me your serial code (e.g. \`AF66\`)\n` +
    `2️⃣  I'll look it up in our secure database\n` +
    `3️⃣  Your account details appear with copy buttons\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*Tips:*\n` +
    `• Codes are *not* case-sensitive — \`af66\` and \`AF66\` both work\n` +
    `• Tap any 📋 button to copy a single detail to your clipboard\n` +
    `• Your data is fetched live from our secure database\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*Commands:*\n` +
    `/start    — Show the welcome message\n` +
    `/help     — Show this help page\n` +
    `/language — Change language\n\n` +
    `❓ Having trouble? Contact your service provider.`,

  // ── Lookup ────────────────────────────────────────────────────────────────
  searching: (code) =>
    `🔍 Looking up code *${code}* ...\n\nPlease wait a moment.`,

  accountFound: (row) =>
    `✅ *Account Found!*\n\n` +
    `Here are your account details.\n` +
    `Tap any 📋 button below to copy that field.\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `🔑  *Serial Code*\n\`${row.code}\`\n\n` +
    `👤  *Account*\n\`${row.account}\`\n\n` +
    `🔒  *Password*\n\`${row.password}\`\n\n` +
    `🎂  *Birthday*\n\`${row.birthday}\`\n\n` +
    `📱  *Phone*\n\`${row.phone}\`\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `⚠️ Keep this information *private and secure*.`,

  notFound: (code) =>
    `❌ *Code Not Found*\n\n` +
    `We couldn't find any account matching:\n\n` +
    `      \`${code}\`\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*Please check:*\n` +
    `• Did you type the code correctly?\n` +
    `• Codes are letters and numbers only (e.g. \`AF66\`)\n` +
    `• Contact your service provider if the problem persists\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `Try again by sending your code, or type /help for guidance.`,

  invalidCode:
    `⚠️ *Invalid Code Format*\n\n` +
    `A valid serial code contains only *letters and numbers* — for example:\n\n` +
    `      \`AF66\`   \`XY12\`   \`ZZ99\`\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Please check your code and try again.\n` +
    `Type /help if you need assistance.`,

  dbError:
    `🚨 *Service Temporarily Unavailable*\n\n` +
    `We were unable to connect to our database at this moment.\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*What to do:*\n` +
    `• Wait a few seconds and try again\n` +
    `• If the issue continues, contact your service provider\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `We apologise for the inconvenience. 🙏`,

  unknownMessage:
    `🤔 *I didn't quite get that.*\n\n` +
    `To look up an account, just send your *serial code* directly — for example:\n\n` +
    `      \`AF66\`\n\n` +
    `Type /help for full instructions.`,

  // ── Copy button labels ────────────────────────────────────────────────────
  copyButtons: {
    code:     '📋 Copy Serial Code',
    account:  '📋 Copy Account',
    password: '📋 Copy Password',
    birthday: '📋 Copy Birthday',
    phone:    '📋 Copy Phone',
  },

  // ── Copy message (sent after tapping a copy button) ───────────────────────
  copyMessage: (label, value) =>
    `${label}\n\nTap the text below to copy it:\n\`${value}\``,

  // ── Field labels (used in copy toast) ────────────────────────────────────
  fieldLabels: {
    code:     '🔑 Serial Code',
    account:  '👤 Account',
    password: '🔒 Password',
    birthday: '🎂 Birthday',
    phone:    '📱 Phone',
  },

  // ── Language menu ─────────────────────────────────────────────────────────
  languageMenu: '🌐 *Choose your language:*\n\nزبان خود را انتخاب کنید:',
};
