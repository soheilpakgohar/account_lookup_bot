# 🔐 Account Lookup Bot

A Telegram bot that lets clients enter a **serial code** (e.g. `AF66`) and instantly receive their full account details — with a dedicated **Copy** button for every single field.

---

## ✨ Features

- 🔍 **Serial code lookup** — type your code, get your details in seconds
- 📋 **Per-field copy buttons** — tap to copy Code, Account, Password, Birthday, or Phone individually
- 🗄️ **Supabase backend** — queries your live Supabase database via REST
- 🛡️ **Clear error messages** — invalid code, not found, DB error — every case handled
- 🔒 **Case-insensitive** — `af66` and `AF66` both work

---

## 📁 Project Structure

```
account-bot/
├── src/
│   ├── index.js              # Entry point — creates bot, wires handlers
│   ├── config.js             # Loads & validates .env
│   ├── supabase.js           # Supabase REST API client
│   ├── messages.js           # All user-facing text (easy to edit/translate)
│   ├── keyboards.js          # Builds inline copy-button keyboards
│   └── handlers/
│       ├── commands.js       # /start, /help
│       ├── lookup.js         # Serial code detection + Supabase query
│       └── callbacks.js      # Copy button taps
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Supabase Table Setup

Create a table named **`accounts`** (or whatever you set in `SUPABASE_TABLE`) with these columns:

| Column     | Type   | Notes                        |
|------------|--------|------------------------------|
| `id`       | int8   | Primary key (auto)           |
| `code`     | text   | Serial code, e.g. `AF66`     |
| `account`  | text   | Account username             |
| `password` | text   | Account password             |
| `birthday` | text   | e.g. `1990-05-14`            |
| `phone`    | text   | e.g. `+1 555 123 4567`       |

**Row Level Security:** Make sure the `anon` role has **SELECT** access on this table, or use your service role key in `SUPABASE_KEY`.

---

## 🚀 Setup & Running

### 1. Create a Telegram Bot

1. Message **@BotFather** on Telegram
2. Send `/newbot` and follow the steps
3. Copy your bot token

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure `.env`

```bash
cp .env.example .env
```

Fill in your `.env`:

```
BOT_TOKEN=123456789:ABCdef...
SUPABASE_URL=https://npunqibllmhpvsikalkt.supabase.co/rest/v1
SUPABASE_KEY=your_supabase_anon_or_service_key
SUPABASE_TABLE=accounts
```

### 4. Start the Bot

```bash
npm start        # production
npm run dev      # auto-restarts on changes (requires nodemon)
```

---

## 💬 Bot Flow

```
User:  AF66
Bot:   🔍 Looking up code AF66...
       ✅ Account Found!
       ─────────────────
       🔑 Serial Code  `AF66`
       👤 Account      `john_doe`
       🔒 Password     `Xk9#mP2!`
       🎂 Birthday     `1990-05-14`
       📱 Phone        `+1 555 123 4567`
       ─────────────────
       [📋 Copy Serial Code]
       [📋 Copy Account    ]
       [📋 Copy Password   ]
       [📋 Copy Birthday   ]
       [📋 Copy Phone      ]

User:  (taps "📋 Copy Password")
Bot:   🔒 Password
       Tap the text below to copy it:
       `Xk9#mP2!`
```

---

## ⚙️ Customisation

### Change the table or column names
Edit `src/supabase.js` — the query uses column names `code`, `account`, `password`, `birthday`, `phone`. Change them to match your actual Supabase schema.

### Edit messages
All text is in `src/messages.js`. Change wording, add emojis, or translate to another language — no logic changes needed.

### Add more fields
1. Add the field to the `accountFound` message in `src/messages.js`
2. Add a copy button for it in `src/keyboards.js`
3. Add the label to `fieldLabels` in `src/handlers/callbacks.js`

---

## 🔒 Security Notes

- **Never commit `.env`** — it's in `.gitignore`
- Use Supabase **Row Level Security (RLS)** to restrict access
- Consider using the **service role key** only on a secure server, not exposed to clients
- Rate-limit the bot if abused (can add per-user cooldown in `lookup.js`)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `409 Conflict` | Another bot instance is polling — stop it |
| `Not Found` for a valid code | Check Supabase RLS allows SELECT for `anon` |
| `Supabase error 401` | Wrong or missing `SUPABASE_KEY` |
| `Supabase error 404` | Wrong table name in `SUPABASE_TABLE` |
| Bot not responding | Check `BOT_TOKEN` is correct |
