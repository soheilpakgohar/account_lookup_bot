// src/messages.js
// All bot text lives here so you can easily translate or tweak wording.

const messages = {

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
    `/start — Show the welcome message\n` +
    `/help  — Show this help page\n\n` +
    `❓ Having trouble? Contact your service provider.`,

  // ── Lookup: searching ─────────────────────────────────────────────────────
  searching: (code) =>
    `🔍 Looking up code *${code.toUpperCase()}* ...\n\nPlease wait a moment.`,

  // ── Lookup: account found ─────────────────────────────────────────────────
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

  // ── Lookup: code not found ────────────────────────────────────────────────
  notFound: (code) =>
    `❌ *Code Not Found*\n\n` +
    `We couldn't find any account matching:\n\n` +
    `      \`${code.toUpperCase()}\`\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*Please check:*\n` +
    `• Did you type the code correctly?\n` +
    `• Codes are letters and numbers only (e.g. \`AF66\`)\n` +
    `• Contact your service provider if the problem persists\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `Try again by sending your code, or type /help for guidance.`,

  // ── Lookup: invalid format ────────────────────────────────────────────────
  invalidCode:
    `⚠️ *Invalid Code Format*\n\n` +
    `A valid serial code contains only *letters and numbers* — for example:\n\n` +
    `      \`AF66\`   \`XY12\`   \`ZZ99\`\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `Please check your code and try again.\n` +
    `Type /help if you need assistance.`,

  // ── Database / network error ──────────────────────────────────────────────
  dbError:
    `🚨 *Service Temporarily Unavailable*\n\n` +
    `We were unable to connect to our database at this moment.\n\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `*What to do:*\n` +
    `• Wait a few seconds and try again\n` +
    `• If the issue continues, contact your service provider\n` +
    `━━━━━━━━━━━━━━━━━━━\n\n` +
    `We apologise for the inconvenience. 🙏`,

  // ── Unknown message (not a command, not a valid code) ─────────────────────
  unknownMessage:
    `🤔 *I didn't quite get that.*\n\n` +
    `To look up an account, just send your *serial code* directly — for example:\n\n` +
    `      \`AF66\`\n\n` +
    `Type /help for full instructions.`,
};

module.exports = messages;
