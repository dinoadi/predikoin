# 🚀 BITCOIN PREDICTOR - INSTALLATION STEPS

## 5 MENIT SETUP

### ✅ SEBELUM MULAI - PERSIAPAN

**Install dulu:**
- Node.js v14+ → https://nodejs.org/
- Git (optional)
- Text editor (Notepad / VSCode)

**Daftar GRATIS (5 minutes):**
- ❌ NOT NEEDED - semua API public!
- ✅ Optional: NewsAPI → https://newsapi.org/ (untuk precision)

---

## 📋 STEP 1: CLONE / DOWNLOAD PROJECT

**Where:** `d:/Arief/predikoin/` (sudah ada)

**Verify:**
```bash
cd d:/Arief/predikoin
ls -la
# Harus ada: functions/, utils/, public/, .env, package.json
```

---

## 📦 STEP 2: INSTALL DEPENDENCIES (1 minute)

```bash
npm install
```

**Expected output:**
```
added XXX packages in X.XXs
```

If error:
```bash
npm install -g npm@latest
npm cache clean --force
npm install
```

---

## ⚙️ STEP 3: CONFIGURE .env FILE (1 minute)

### Edit .env:
```bash
# Windows:
notepad .env

# VSCode:
code .env

# Or any text editor
```

### STEP 3A: Set Admin Password

**Find this line:**
```env
ADMIN_PASSWORD=your_secure_password_here
```

**Change to:**
```env
ADMIN_PASSWORD=MyPassword123
```
(Use any password you want)

---

### STEP 3B: Optional - Add NewsAPI (for better predictions)

1. **Go to:** https://newsapi.org/
2. **Click:** "Register"
3. **Get:** Free API Key
4. **Paste in .env:**

```env
NEWSAPI_KEY=your_newsapi_key_here
```

(If skip: system still works, just less news data)

---

## 🚀 STEP 4: START THE SYSTEM (immediate)

```bash
npm run dev-admin
```

**You should see:**
```
✅ Admin Dashboard running at http://localhost:3000
📊 Go to: http://localhost:3000
   Username: admin
   Password: MyPassword123
```

**Keep terminal OPEN** - don't close it!

---

## 🌐 STEP 5: ACCESS WEB DASHBOARD

### Open Browser:
```
http://localhost:3000
```

### Login:
- Username: `admin`
- Password: `MyPassword123` (what you set in .env)

### You see:
```
✓ Real-time price chart
✓ Latest predictions
✓ Sentiment analysis
✓ Trading signals
✓ System status
```

---

## 📱 STEP 6: TEST TELEGRAM BOT

### Send Commands to Bot:
```
/help       ← See all commands
/price      ← Current Bitcoin price
/predict    ← Latest AI prediction
/sentiment  ← News sentiment
/signals    ← Recent signals
/today      ← Today's stats
/status     ← System health
```

**Expected response in 1-2 seconds**

---

## ✅ STEP 7: VERIFY ALL WORKING

### Checklist:

- [ ] npm run dev-admin running
- [ ] http://localhost:3000 loads
- [ ] Can login with admin/password
- [ ] Dashboard shows data
- [ ] /price command works on Telegram
- [ ] /predict command works
- [ ] Shows BUY/SELL/HOLD signal

**If all ✓ = System is 100% ready!**

---

## 🎯 WHAT HAPPENS NEXT

### Every 1 Hour (Automatically):

```
:00 → fetch_price function runs
      ├─ Get OHLCV from Binance, Bybit, CoinGecko
      ├─ Calculate technical indicators
      ├─ Store in database
      └─ Update dashboard

:00 → predict_bitcoin function runs (same time)
      ├─ Analyze all 7 signals
      ├─ Generate confidence score
      ├─ Create BUY/SELL/HOLD signal
      ├─ Send to Telegram
      └─ Update web dashboard

Every 2 hours:
:00 → news_sentiment function runs
      ├─ Fetch latest news
      ├─ Analyze sentiment
      └─ Update prediction factors
```

---

## 🛠️ TROUBLESHOOTING

### Problem: npm install fails

```bash
npm install -g npm@latest
npm cache clean --force
npm install
```

---

### Problem: Cannot access http://localhost:3000

- [ ] Terminal running npm run dev-admin?
- [ ] Try: http://127.0.0.1:3000
- [ ] Check port not blocked

---

### Problem: Dashboard shows "No data"

**Wait:** Functions run every hour

Or trigger manually:
```bash
curl http://localhost:3000/api/dashboard
```

---

### Problem: Telegram bot not responding

- Check TELEGRAM_CHAT_ID = 434699276 in .env ✓
- Send /help to bot
- Check Node terminal for errors

---

## 🎮 COMMANDS REFERENCE

```
/help       - All commands
/price      - BTC price
/predict    - AI prediction
/sentiment  - News sentiment
/signals    - Recent signals
/today      - Day stats
/status     - System health
/chart      - Price chart
/start      - Welcome
```

---

## 📊 DATA SOURCES (All FREE!)

✓ Binance API (public, no auth)
✓ Bybit API (public, no auth)
✓ CoinGecko (no key!)
✓ CryptoPanic (public, no auth)
✓ NewsAPI (optional)
✓ 15+ more APIs

---

## 🚀 ALL DONE!

```bash
npm run dev-admin

# Then visit:
http://localhost:3000

# Test Telegram:
/help
```

✅ AI Predictions Ready
✅ Sentiment Analysis Ready
✅ Telegram Updates Ready
✅ Web Dashboard Ready

**Happy Trading! 🤖💎**
