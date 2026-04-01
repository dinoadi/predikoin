# 🚀 Setup Guide - Bitcoin Predictor

## 📋 Daftar Perubahan yang Sudah Dibuat

### ✅ Sudah Selesai:
1. **5 Appwrite Functions:**
   - `fetch_price` - Ambil data harga setiap 1 jam
   - `news_sentiment` - Analisis sentiment berita setiap 2 jam
   - `tradingview_webhook` - Terima alert teknikal dari TradingView
   - `predict_bitcoin` - Generate prediksi setiap 1 jam
   - `telegram_notif` - Kirim notifikasi ke Telegram

2. **Utility Modules:**
   - `data-fetcher.js` - Fetch dari Binance & Bybit
   - `sentiment-analyzer.js` - Analisis sentiment dari news
   - `technical-indicators.js` - Hitung RSI, MA, BB, dll
   - `prediction-model.js` - ML model untuk trading signals
   - `telegram-client.js` - Send messages ke Telegram
   - `monitoring-helper.js` - Track performance

3. **Database Schema:** Siap untuk 5 collections

### 🔄 Yang Perlu Anda Setup:

## STEP 1: Update .env File

```bash
# File: .env (SUDAH ADA TEMPLATE)
```

**Yang HARUS diubah:**

```env
# 1. Appwrite Configuration
APPWRITE_API_ENDPOINT=http://localhost/v1  # Ganti dengan server Appwrite Anda
APPWRITE_API_KEY=xxxxxxxx                   # Dari Appwrite Console
APPWRITE_PROJECT_ID=xxxxxxxx                # Dari Appwrite Console

# 2. Exchange APIs
BINANCE_API_KEY=xxx                         # Dari https://binance.com/account/api-management
BINANCE_API_SECRET=xxx

BYBIT_API_KEY=xxx                           # Dari https://www.bybit.com/en/user/api-management
BYBIT_API_SECRET=xxx

# 3. News APIs
CRYPTOPANIC_API_KEY=xxx                     # Dari https://cryptopanic.com/developers
NEWSAPI_KEY=xxx                             # Dari https://newsapi.org/

# 4. Telegram (✅ SUDAH ANDA BERIKAN)
TELEGRAM_BOT_TOKEN=8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo
TELEGRAM_CHAT_ID=xxx                        # Cari ID Anda di step 7

# 5. Web Admin
ADMIN_PASSWORD=your_strong_password_here    # Ganti dengan password kuat
```

---

## STEP 2: Dapatkan Telegram Chat ID

1. **Kirim pesan ke bot Anda:**
   - Buka Telegram dan cari bot dengan token yang Anda punya
   - Atau kirim `/help` ke bot

2. **Dapatkan Chat ID:**
   ```bash
   curl https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getUpdates
   ```

   Lihat `"chat":{"id":XXXXXXX}` - itu Chat ID Anda

3. **Update .env:**
   ```env
   TELEGRAM_CHAT_ID=XXXXXXX
   ```

---

## STEP 3: Setup Appwrite

### 3.1 Install Appwrite CLI
```bash
npm install -g appwrite-cli
```

### 3.2 Login & Connect
```bash
appwrite login
appwrite project list
appwrite init
```

### 3.3 Create Database Collections

Di **Appwrite Console** → Databases → **+ Create Collection**

**Collection 1: price_data**
```
Attributes:
- symbol (string, required)
- spotPrice (float, required)
- binanceCandles (integer)
- bybitCandles (integer)
- openInterest (float)
- fundingRate (string)
- timestamp (datetime, required)
- createdAt (datetime, default: now)
```

**Collection 2: sentiment_data**
```
Attributes:
- articlesCount (integer)
- averageSentiment (float)
- label (string, enum: positive/negative/neutral)
- timestamp (datetime, required)
```

**Collection 3: ta_alerts**
```
Attributes:
- alertId (string, unique)
- signal (string)
- price (float)
- direction (string, enum: UP/DOWN)
- weight (float)
- timestamp (datetime)
```

**Collection 4: predictions**
```
Attributes:
- symbol (string)
- currentPrice (float)
- prediction (string, enum: UP/DOWN/NEUTRAL)
- confidence (float)
- action (string, enum: BUY/SELL/HOLD)
- riskLevel (string)
- sentiment (string)
- timestamp (datetime)
```

**Collection 5: notifications**
```
Attributes:
- type (string)
- messageId (integer)
- success (boolean)
- sentAt (datetime)
```

---

## STEP 4: Deploy Functions

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Deploy Setiap Function

```bash
# Method 1: Manual Upload (Recommended)
# Di Appwrite Console → Functions → Create Function → Upload File

# Method 2: CLI
appwrite deploy functions fetch_price \
  --path functions/fetch_price.js \
  --trigger cron \
  --schedule "0 * * * *" \
  --timeout 900

# Ulangi untuk semua functions
```

### 4.3 Set Environment Variables

Di Appwrite Console → Functions → (setiap function) → Settings

Tambahkan semua variables dari `.env`:
- `BINANCE_API_KEY`
- `BINANCE_API_SECRET`
- `BYBIT_API_KEY`
- Dst...

---

## STEP 5: Configure Cron Triggers

Di **Appwrite Console** → Functions → (pilih function) → Settings → Cron

| Function | Cron Schedule | Meaning |
|----------|---------------|---------|
| fetch_price | `0 * * * *` | Setiap jam pada menit 00 |
| news_sentiment | `0 */2 * * *` | Setiap 2 jam |
| predict_bitcoin | `0 * * * *` | Setiap jam pada menit 00 |
| tradingview_webhook | - | HTTP trigger (manual) |
| telegram_notif | - | HTTP trigger (manual) |

---

## STEP 6: Setup TradingView Webhook

1. **Di TradingView, buat Alert:**
   - Indicator: RSI, Moving Average, Bollinger Bands, dll
   - Alert: "TradingView Alert Name"
   - Webhook URL: `https://your-domain/functions/tradingview_webhook`

2. **Webhook Payload (JSON):**
   ```json
   {
     "alert_id": "{{alert.id}}",
     "signal": "RSI_BULLISH",
     "price": {{close}},
     "indicator": "RSI",
     "weight": 0.15
   }
   ```

3. **Valid Signals:**
   - `RSI_BULLISH` / `RSI_BEARISH`
   - `MA_CROSS_UP` / `MA_CROSS_DOWN`
   - `BB_BREAKUP` / `BB_BREAKDOWN`
   - `MACD_BULLISH` / `MACD_BEARISH`

---

## STEP 7: Jalankan Web Admin Dashboard

```bash
# Terminal 1: Start Appwrite (jika local)
docker compose up

# Terminal 2: Start Web Dashboard
npm run dev-admin

# Akses: http://localhost:3000
# Login:
# - Username: admin
# - Password: (dari .env ADMIN_PASSWORD)
```

---

## STEP 8: Test Semua Functions

### Test 1: Fetch Price
```bash
curl -X POST https://your-domain/functions/fetch_price \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test 2: Predict Bitcoin
```bash
curl -X POST https://your-domain/functions/predict_bitcoin \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test 3: Send Test Telegram
```bash
curl -X POST https://your-domain/functions/telegram_notif \
  -H "Content-Type: application/json" \
  -d '{
    "type": "alert",
    "data": {
      "title": "Test Alert",
      "message": "Setup berhasil!",
      "alertType": "SUCCESS"
    }
  }'
```

---

## 🔄 Data Management

### Auto Cleanup (1 hari retention)

**Function: cleanup_old_data**

Runs daily at midnight (`0 0 * * *`) untuk hapus data > 1 hari

```javascript
// Hapus otomatis:
- price_data older than 1 day
- sentiment_data older than 1 day
- ta_alerts older than 1 day
- predictions older than 1 day
- notifications older than 1 day tapi keep success=true untuk 7 hari
```

---

## 💬 Access via Telegram

### Commands Available:

```
/status        - Get current market status
/price         - Show current Bitcoin price
/predict       - Get latest prediction
/sentiment     - Show news sentiment
/signals       - Show recent buy/sell signals
/today         - Show today's data
/help          - Show all commands
```

### Contoh:
```
User: /price
Bot:
📊 Current Bitcoin Price
Price: $42,000.50
Change: +2.5% (24h)
Updated: 2024-04-02 10:00:00
```

---

## 🌐 Access via Web Admin

### Features:

1. **Dashboard**
   - Real-time price chart
   - Prediction status
   - Sentiment gauge
   - Latest signals

2. **History**
   - Price history (24 jam terakhir)
   - Predictions log
   - Sentiment trends
   - Trades executed

3. **Settings**
   - Model threshold
   - Cron schedules
   - API status
   - Cleanup policy

4. **Webhooks**
   - TradingView alerts log
   - Failed requests
   - Retry mechanism

---

## 🔒 Security Best Practices

1. **API Keys:**
   - Store di `.env`, JANGAN commit
   - Use separate keys untuk dev/prod
   - Rotate regularly

2. **Telegram Bot:**
   - Only accept requests dari authorized Appwrite functions
   - Validate webhook signatures

3. **Web Admin:**
   - Use strong password
   - Enable HTTPS production
   - Limit admin access

4. **Database:**
   - Enable backups
   - Use read-only keys untuk functions
   - Audit logging

---

## 📚 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│          BITCOIN PRICE PREDICTION SYSTEM               │
└─────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │  DATA SOURCES       │
                    ├─────────────────────┤
                    │ • Binance API       │
                    │ • Bybit API         │
                    │ • CryptoPanic       │
                    │ • NewsAPI           │
                    │ • TradingView       │
                    └─────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │    APPWRITE FUNCTIONS (Serverless)   │
        ├───────────────────────────────────────┤
        │ 1. fetch_price (Cron: every 1h)      │
        │ 2. news_sentiment (Cron: every 2h)   │
        │ 3. tradingview_webhook (HTTP)        │
        │ 4. predict_bitcoin (Cron: every 1h)  │
        │ 5. telegram_notif (HTTP)             │
        └───────────────────────────────────────┘
                          ↓
        ┌───────────────────────────────────────┐
        │    APPWRITE DATABASE                 │
        ├───────────────────────────────────────┤
        │ • price_data (↓ cleanup 1 day)       │
        │ • sentiment_data (↓ cleanup 1 day)   │
        │ • ta_alerts (↓ cleanup 1 day)        │
        │ • predictions (↓ cleanup 1 day)      │
        │ • notifications (↓ cleanup 7 days)   │
        └───────────────────────────────────────┘
                    ↙        ↓        ↖
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Telegram │  │   Web    │  │ External │
        │   Bot    │  │ Dashboard│  │ APIs     │
        └──────────┘  └──────────┘  └──────────┘
```

---

## ⚠️ Troubleshooting

### Issue: Telegram bot tidak kirim pesan
**Solution:**
1. Verify bot token benar di `.env`
2. Check TELEGRAM_CHAT_ID valid
3. Test: `curl https://api.telegram.org/bot{TOKEN}/getMe`
4. Check function logs di Appwrite

### Issue: Predictions tidak generate
**Solution:**
1. Verify data fetch berhasil (check fetch_price logs)
2. Ensure minimum 26 candles ada
3. Check API rate limits
4. Verify all API keys valid

### Issue: Data cleanup tidak jalan
**Solution:**
1. Check cleanup function deployed
2. Verify Cron schedule: `0 0 * * *`
3. Check database indexes exist
4. Monitor function logs for errors

### Issue: Web dashboard tidak bisa login
**Solution:**
1. Verify ADMIN_PASSWORD di `.env` correct
2. Check browser cache
3. Verify Appwrite API endpoint accessible
4. Check CORS headers

---

## 📞 Support Commands

```bash
# Check all function status
npm run check-functions

# View live logs
npm run logs

# Test all APIs
npm run test-all

# Generate report
npm run report

# Cleanup database (manual)
npm run cleanup

# Reset data (dev only)
npm run reset-data
```

---

## 🎉 Setup Complete!

Setelah semua step selesai, sistem Anda siap untuk:
✅ Fetch real-time Bitcoin data
✅ Analyze sentiment dari news
✅ Process TradingView alerts
✅ Generate price predictions
✅ Send Telegram notifications
✅ Store data dengan auto-cleanup 1 hari
✅ Access via Telegram bot 24/7
✅ Access via Web admin dashboard

**Enjoy! 🚀**
