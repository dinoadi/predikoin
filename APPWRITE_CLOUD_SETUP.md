# 🚀 APPWRITE CLOUD SETUP - YOUR CONFIGURATION

## ✅ CREDENTIALS CONFIGURED

```
Endpoint: https://sgp.cloud.appwrite.io/v1 ✓
Project ID: 69cd732d001088d78edf ✓
API Key: [CONFIGURED] ✓
Region: Singapore (sgp) ✓
```

---

## 📋 STEP 1: SET ADMIN PASSWORD

Edit `.env`:
```bash
notepad .env
```

Find line:
```env
ADMIN_PASSWORD=your_secure_password_here
```

Change to:
```env
ADMIN_PASSWORD=MyPassword123
```

Save file.

---

## 📦 STEP 2: INSTALL DEPENDENCIES

```bash
cd d:/Arief/predikoin
npm install
```

This installs all required packages (Express, Telegram, Appwrite SDK, etc).

---

## 🗄️ STEP 3: CREATE DATABASE COLLECTIONS

Go to: https://cloud.appwrite.io/

Login with your account, then:

### Collection 1: price_data
```
Settings → Databases → Create Database
Database Name: "bitcoin_data"

Create Collection in this database:
Name: "price_data"

Attributes:
- symbol (string, required)
- spotPrice (float, required)
- binanceCandles (integer)
- bybitCandles (integer)
- openInterest (float)
- fundingRate (string)
- timestamp (datetime, required)
- createdAt (datetime, auto-set: now)

Indexes:
- symbol + timestamp (composite)
```

### Collection 2: sentiment_data
```
Name: "sentiment_data"

Attributes:
- articlesCount (integer)
- averageSentiment (float)
- label (string)
- timestamp (datetime, required)
```

### Collection 3: ta_alerts
```
Name: "ta_alerts"

Attributes:
- alertId (string)
- signal (string)
- price (float)
- direction (string)
- weight (float)
- timestamp (datetime)
```

### Collection 4: predictions
```
Name: "predictions"

Attributes:
- symbol (string)
- currentPrice (float)
- prediction (string)
- confidence (float)
- action (string)
- riskLevel (string)
- sentiment (string)
- timestamp (datetime, required)
```

### Collection 5: notifications
```
Name: "notifications"

Attributes:
- type (string)
- messageId (integer)
- success (boolean)
- sentAt (datetime)
```

---

## 🔧 STEP 4: UPDATE DATABASE ID IN .ENV

After creating database, find the Database ID:

1. Go to Appwrite Console
2. Databases → bitcoin_data
3. Copy the ID

Update `.env`:
```env
APPWRITE_DATABASE_ID=your_database_id
```

---

## 🚀 STEP 5: START THE SYSTEM

```bash
npm run dev-admin
```

You should see:
```
✅ Admin Dashboard running at http://localhost:3000
📊 Go to: http://localhost:3000
   Username: admin
   Password: MyPassword123
```

---

## 🌐 STEP 6: ACCESS DASHBOARD

Open browser: http://localhost:3000

Login:
- Username: `admin`
- Password: `MyPassword123` (what you set)

---

## 📱 STEP 7: TEST TELEGRAM BOT

Find the Telegram bot (search for the token) and send:
```
/help
/price
/predict
```

You should get responses within 1-2 seconds.

---

## 📊 STEP 8: VERIFY IN APPWRITE CLOUD

Go back to Appwrite Console:

1. Check Databases → bitcoin_data
2. Collections should be empty (first data comes after 1 hour)
3. Logs tab should show function executions

---

## ⏰ HOW DATA FLOWS

### First Run:
```
npm run dev-admin
↓
System connects to Appwrite Cloud
↓
Express server starts at localhost:3000
↓
Awaits first hourly cron (next :00 minute)
```

### Every Hour at :00:
```
fetch_price kicks in
  ├─ Fetches from 5 exchanges
  ├─ Stores in price_data collection
  └─ Logs to Appwrite

predict_bitcoin kicks in (same time)
  ├─ Analyzes all data
  ├─ Creates prediction record
  ├─ Sends Telegram message
  └─ Updates dashboard

news_sentiment (every 2 hours)
  ├─ Fetches news
  ├─ Analyzes sentiment
  └─ Updates database

data_cleanup (every day at midnight)
  ├─ Deletes old data > 1 day
  └─ Keeps DB lightweight
```

---

## 🛠️ TROUBLESHOOTING

### Error: "Cannot connect to Appwrite"
```
Check:
1. Endpoint URL correct?
2. API Key correct?
3. Project ID correct?
4. Internet connection?
5. Appwrite Cloud project active?

If still failing:
- Go to Appwrite Console
- Check project settings
- Regenerate API keys if needed
```

### Error: "Collection not found"
```
Solution:
1. Create all 5 collections (see STEP 3)
2. Update APPWRITE_DATABASE_ID in .env
3. Restart: npm run dev-admin
```

### Telegram bot not responding
```
Check:
1. Bot token in .env: 8603957892:AAG4os5HzH6BS1kkzC6C3eifsEkmyNNEaYo ✓
2. Chat ID: 434699276 ✓
3. Send /help to start bot
4. Check Node console for errors
```

### Dashboard shows "No data"
```
Wait: Functions run at :00 every hour
  └─ First prediction after next :00

Check if you want to test immediately:
  - Database created? ✓
  - Collections exist? ✓
  - API key valid? ✓
```

---

## 📈 MONITORING

### Check predictions in Appwrite Console:
1. Go to Databases → bitcoin_data → Collections
2. Click "predictions"
3. View recent records
4. Check timestamps

### View function logs:
1. Go to Functions
2. Click function name
3. Executions tab
4. View logs

---

## 🎯 COMMANDS REFERENCE

```bash
# Start dashboard
npm run dev-admin

# Stop (Ctrl+C in terminal)

# Test specific function
curl http://localhost:3000/api/dashboard

# Check logs
npm run logs
```

---

## 📱 TELEGRAM COMMANDS AVAILABLE

Once running, send to bot:
```
/help       - Show all commands
/price      - Current BTC price
/predict    - Latest prediction
/sentiment  - News sentiment
/signals    - Recent signals
/today      - Today stats
/status     - System health
/chart      - Price chart
```

---

## ✅ CHECKLIST

- [ ] npm install complete
- [ ] .env has ADMIN_PASSWORD
- [ ] Appwrite collections created (5 total)
- [ ] DATABASE_ID updated in .env
- [ ] npm run dev-admin running
- [ ] http://localhost:3000 loads
- [ ] Can login with admin/password
- [ ] /help command works on Telegram
- [ ] System showing data on dashboard

**All ✓ = System 100% Ready!**

---

## 🎉 YOU'RE ALL SET!

Your Bitcoin Predictor is now connected to **Appwrite Cloud** (Singapore region).

System Status:
✅ Connected to Appwrite Cloud
✅ Using 20+ public APIs
✅ Telegram bot ready
✅ Web dashboard ready
✅ Auto-predictions every hour
✅ All data synced to cloud

Happy trading! 🤖💎

---

## 📞 NEXT STEPS

1. Create database collections (STEP 3)
2. Update DATABASE_ID in .env (STEP 4)
3. Start system (STEP 5)
4. Check Appwrite Console for data
5. Monitor predictions

Questions? Check:
- INSTALL_NOW.md
- 00_README_INI_DULU.txt
- DEPLOYMENT_OPTIONS.md
