# 🚀 Setup Guide - Bitcoin Predictor (Public APIs Version)

## 📋 Apa yang Dipakai

### ✅ GRATIS - Tidak perlu API Key:
- **Binance API** - Public endpoints
- **Bybit API** - Public endpoints
- **CoinGecko API** - No key needed, free tier generous
- **CryptoPanic API** - Free public access

### ✅ GRATIS - Minimal setup:
- **NewsAPI** - Free tier (250/day)
- **Telegram Bot** - ✅ Sudah Anda punya
- **Appwrite** - Self-hosted gratis

---

## 🛠️ STEP 1: Clone & Install

```bash
# Clone/download project
cd d:/Arief/predikoin

# Install dependencies
npm install

# Run setup
npm run setup
```

---

## 📝 STEP 2: Update .env File

```bash
# Edit .env
nano .env
```

**WAJIB DIUBAH:**

```env
# 1. Appwrite (kalau sudah punya instance)
APPWRITE_API_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_master_key

# 2. NewsAPI (GRATIS - Optional)
# Daftar di https://newsapi.org/
# Free tier: 250 requests/day
NEWSAPI_KEY=your_newsapi_free_key

# 3. Telegram Bot (✅ SUDAH ADA)
TELEGRAM_BOT_TOKEN=8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo
TELEGRAM_CHAT_ID=your_chat_id

# 4. Admin Dashboard
ADMIN_PASSWORD=your_secure_password
```

**Yang TIDAK perlu:**
- ❌ BINANCE_API_KEY/SECRET - Publik!
- ❌ BYBIT_API_KEY/SECRET - Publik!
- ❌ CRYPTOPANIC_API_KEY - Publik!

---

## 🔑 STEP 3: Dapatkan Chat ID Telegram

```bash
# 1. Send message ke bot:
curl "https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getUpdates"

# 2. Cari "chat":{"id":XXXXXXX}
# 3. Update .env:
TELEGRAM_CHAT_ID=XXXXXXX
```

---

## 💾 STEP 4: Setup Database

### Option A: Appwrite Self-Hosted (Recommended)

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Deploy functions
appwrite deploy
```

### Option B: SQLite Local (Simple)

Kalau ga mau Appwrite, bisa pakai SQLite lokal:

```bash
npm install sqlite3
```

---

## 🤖 STEP 5: Jalankan System

### Start Admin Dashboard:
```bash
npm run dev-admin
```

Akses: http://localhost:3000
- Username: `admin`
- Password: (dari .env)

---

## 📱 STEP 6: Telegram Bot Commands

Kirim ke bot:

```
/start    - Welcome message
/price    - Current BTC price
/predict  - AI prediction
/sentiment - News sentiment
/signals   - Recent signals
/today     - Today stats
/help      - All commands
```

---

## ✅ Verifikasi Semua Berfungsi

### Test 1: Fetch Price
```bash
curl http://localhost:3000/api/dashboard
```

### Test 2: Telegram
Kirim `/price` ke bot

### Test 3: Check Logs
```bash
npm run logs
```

---

## 📊 Alur Kerja

```
┌─────────────────────────────────────────┐
│   DATA SOURCES (PUBLIC - NO KEY)        │
├─────────────────────────────────────────┤
│ ✓ Binance API (public endpoints)        │
│ ✓ Bybit API (public endpoints)          │
│ ✓ CoinGecko (no key needed)             │
│ ✓ CryptoPanic (public)                  │
│ ✓ NewsAPI (free tier)                   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│   PROCESSING (Local Node.js)            │
├─────────────────────────────────────────┤
│ • Fetch OHLCV data                      │
│ • Calculate RSI, MA, BB                 │
│ • Analyze news sentiment                │
│ • Generate predictions                  │
│ • Create trade signals                  │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│   STORAGE (Appwrite or SQLite)          │
├─────────────────────────────────────────┤
│ ✓ Price data                            │
│ ✓ Predictions                           │
│ ✓ Sentiments                            │
│ ✓ Auto-cleanup after 1 day              │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│   OUTPUT (Web + Telegram)               │
├─────────────────────────────────────────┤
│ ✓ Web Dashboard (localhost:3000)        │
│ ✓ Telegram Bot (24/7 updates)           │
└─────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

| Service | Cost | Limit |
|---------|------|-------|
| Binance API | **FREE** | Public endpoints |
| Bybit API | **FREE** | Public endpoints |
| CoinGecko | **FREE** | 10-50 calls/min |
| CryptoPanic | **FREE** | Public access |
| NewsAPI | **FREE** | 250/day (free tier) |
| Telegram Bot | **FREE** | Unlimited |
| Appwrite | **FREE** | Self-hosted or starter |
| **TOTAL** | **$0** | - |

---

## 🔄 Functions Schedule

Berjalan otomatis via Appwrite cron:

```
fetch_price        → setiap 1 jam (0 * * * *)
news_sentiment     → setiap 2 jam (0 */2 * * *)
predict_bitcoin    → setiap 1 jam (0 * * * *)
telegram_notif     → triggered
data_cleanup       → setiap hari (0 0 * * *)
```

---

## 📈 Cara Kerja Prediksi

### Signals Dianalisis:
1. **RSI Indicator** - Oversold/Overbought
2. **Moving Average** - Trend direction
3. **Bollinger Bands** - Volatility & breakout
4. **Open Interest** - Institutional pressure
5. **Funding Rate** - Sentiment long/short
6. **News Sentiment** - Market mood
7. **Market Data** - Volume, dominance, dll

### Prediksi Output:
```json
{
  "prediction": "UP",           // UP, DOWN, NEUTRAL
  "confidence": 0.75,           // 0-1 (75%)
  "action": "BUY",              // BUY, SELL, HOLD
  "riskLevel": "LOW",           // LOW, MEDIUM, HIGH
  "signals": 5,                 // 5 confirmed signals
  "sentiment": "positive"       // Market mood
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot fetch price"
```
Solution:
1. Check internet connection
2. Verify Binance/Bybit API available
3. Try CoinGecko instead
```

### Telegram bot tidak reply
```
Solution:
1. Verify bot token benar di .env
2. Check TELEGRAM_CHAT_ID valid
3. Test: curl tg api endpoint
```

### Appwrite database error
```
Solution:
1. Verify Appwrite running
2. Check API endpoint correct
3. Verify collections created
```

### NewsAPI limit exceeded
```
Solution:
- Free tier: 250/day
- Upgrade ke paid atau gunakan CryptoPanic only
```

---

## 📚 File Structure

```
predikoin/
├── .env                          # Configuration (EDIT INI!)
├── .env.example                  # Template
├── package.json                  # Dependencies
│
├── functions/
│   ├── fetch_price.js            # Cron: fetch data
│   ├── news_sentiment.js         # Cron: analyze news
│   ├── predict_bitcoin.js        # Cron: generate predictions
│   ├── tradingview_webhook.js    # HTTP: receive alerts
│   ├── telegram_notif.js         # HTTP: send messages
│   └── data_cleanup.js           # Cron: delete old data
│
├── utils/
│   ├── data-fetcher.js           # API calls
│   ├── sentiment-analyzer.js     # News analysis
│   ├── prediction-model.js       # ML-like predictions
│   ├── telegram-client.js        # Bot sender
│   ├── technical-indicators.js   # RSI, MA, BB
│   └── telegram-bot-handler.js   # Bot command handler
│
├── server/
│   └── admin-server.js           # Web dashboard
│
├── public/
│   ├── index.html                # Login page
│   └── dashboard.html            # Admin dashboard
│
└── README.md                      # This file
```

---

## 🎯 Next Steps

1. ✅ Update `.env` dengan API keys
2. ✅ Run `npm install`
3. ✅ Start: `npm run dev-admin`
4. ✅ Test: `/price` di Telegram
5. ✅ Monitor dashboard di web

---

## 📞 Support

Issues?
- Check logs: `npm run logs`
- Read README.md
- Check .env configuration

---

## 🎉 Done!

**Total time:** ~10 menit
**Cost:** $0
**Maintenance:** Minimal

Sistem sudah jalan! 🚀

```
✓ Real-time Bitcoin price
✓ AI predictions
✓ News sentiment analysis
✓ Trading signals
✓ Telegram 24/7 updates
✓ Web dashboard
✓ Auto data cleanup
```

Enjoy! 💎
