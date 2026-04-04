# 🚀 PANDUAN DEPLOY LENGKAP - Bitcoin Predictor

## Arsitektur Sistem

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    NETLIFY      │     │  APPWRITE CLOUD  │     │    TELEGRAM     │
│  (Frontend)     │     │   (Backend)      │     │     (Bot)       │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ • Dashboard     │────▶│ • Database       │────▶│ • Notifikasi    │
│ • Login Page    │     │ • Functions      │     │ • Commands      │
│ • Charts        │     │ • Cron Jobs      │     │ • Alerts        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## BAGIAN 1: NETLIFY (Frontend Dashboard)

### Step 1.1: Persiapan GitHub Repository

Repository sudah ada di: `https://github.com/dinoadi/predikoin.git`

Pastikan file-file ini ada:
```
predikoin/
├── public/
│   ├── index.html      ← Login page
│   └── dashboard.html  ← Dashboard
├── netlify.toml        ← Konfigurasi Netlify
├── package.json
└── .gitignore          ← Pastikan .env ada di sini!
```

### Step 1.2: Push ke GitHub (jika belum)

```bash
cd d:\Arief\predikoin
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 1.3: Deploy ke Netlify

1. **Buka**: https://app.netlify.com
2. **Login** dengan GitHub
3. **Klik**: "Add new site" → "Import an existing project"
4. **Pilih**: GitHub → Authorize Netlify
5. **Pilih repository**: `dinoadi/predikoin`
6. **Build settings** (otomatis terdeteksi dari netlify.toml):
   - Build command: `npm install`
   - Publish directory: `public`
7. **Klik**: "Deploy site"

### Step 1.4: Custom Domain (Opsional)

1. Site settings → Domain management
2. Klik "Add custom domain"
3. Masukkan domain kamu (contoh: `predikoin.com`)
4. Update DNS records sesuai instruksi Netlify

### Step 1.5: Verifikasi Netlify

✅ Buka URL Netlify (contoh: `https://predikoin.netlify.app`)
✅ Halaman login muncul
✅ Login dengan: `admin` / `Broken12#`
✅ Dashboard tampil dengan data Bitcoin real-time

---

## BAGIAN 2: APPWRITE CLOUD (Backend)

### Step 2.1: Setup Project Appwrite

**Credentials yang sudah ada:**
- Endpoint: `https://sgp.cloud.appwrite.io/v1`
- Project ID: `69cd732d001088d78edf`
- API Key: `standard_8e1648c6eb...` (dari .env)

#sud

### Step 2.4: Deploy Functions (6 total)

Di Appwrite Console:
1. **Klik**: "Functions" di sidebar
2. **Untuk setiap function**, ikuti langkah berikut:

---

#### Function 1: `fetch_price`

1. Klik "+ Create function"
2. **Name**: `fetch_price`
3. **Runtime**: Node.js 18.0
4. **Klik** "Create"

**Upload Code:**
1. Klik function yang baru dibuat
2. Tab "Deployments" → "Create deployment"
3. Pilih "Manual" → Upload file dari `functions/fetch_price.js`

**Atau via CLI** (lebih mudah):
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Deploy function
appwrite functions createDeployment \
  --functionId=fetch_price \
  --entrypoint="functions/fetch_price.js" \
  --code="./functions"
```

**Environment Variables:**
1. Tab "Settings" → Variables
2. Tambahkan:
   - `APPWRITE_API_ENDPOINT` = `https://sgp.cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID` = `69cd732d001088d78edf`
   - `APPWRITE_API_KEY` = `(API key dari .env)`
   - `DATABASE_ID` = `bitcoin_db`

**Schedule (Cron):**
1. Tab "Settings" → Schedule
2. Masukkan: `*/5 * * * *` (setiap 5 menit)
3. Klik "Update"

---

#### Function 2: `news_sentiment`

1. Create function → Name: `news_sentiment`
2. Runtime: Node.js 18.0
3. Upload: `functions/news_sentiment.js`
4. Variables: (sama seperti fetch_price)
5. Schedule: `*/15 * * * *` (setiap 15 menit)

---

#### Function 3: `predict_bitcoin`

1. Create function → Name: `predict_bitcoin`
2. Runtime: Node.js 18.0
3. Upload: `functions/predict_bitcoin.js`
4. Variables: (sama + tambahan)
   - `TELEGRAM_BOT_TOKEN` = `8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo`
   - `TELEGRAM_CHAT_ID` = `434699276`
5. Schedule: `0 * * * *` (setiap jam)

---

#### Function 4: `telegram_notif`

1. Create function → Name: `telegram_notif`
2. Runtime: Node.js 18.0
3. Upload: `functions/telegram_notif.js`
4. Variables:
   - `TELEGRAM_BOT_TOKEN` = `8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo`
   - `TELEGRAM_CHAT_ID` = `434699276`
5. Schedule: Tidak perlu (triggered by other functions)

---

#### Function 5: `data_cleanup`

1. Create function → Name: `data_cleanup`
2. Runtime: Node.js 18.0
3. Upload: `functions/data_cleanup.js`
4. Variables: (sama seperti fetch_price)
5. Schedule: `0 0 * * *` (setiap tengah malam)

---

#### Function 6: `telegram_bot_handler` ⭐ PENTING

1. Create function → Name: `telegram_bot_handler`
2. Runtime: Node.js 18.0
3. Upload: `functions/telegram_bot_handler.js`
4. Variables:
   - `TELEGRAM_BOT_TOKEN` = `8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo`
5. **PENTING**: Tab "Settings" → Domain
   - Catat URL function (contoh: `https://sgp.cloud.appwrite.io/v1/functions/abc123xyz/executions`)

---

## BAGIAN 3: AKTIVASI TELEGRAM BOT

### Step 3.1: Set Webhook

Setelah function `telegram_bot_handler` di-deploy:

1. **Catat Function ID** dari Appwrite (contoh: `67890abcdef`)
2. **Buka URL ini di browser**:

```
https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/setWebhook?url=https://sgp.cloud.appwrite.io/v1/functions/[FUNCTION_ID]/executions
```

Ganti `[FUNCTION_ID]` dengan ID function kamu.

3. **Response yang benar**:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Step 3.2: Verifikasi Webhook

Buka di browser:
```
https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getWebhookInfo
```

Response harus menunjukkan URL webhook yang sudah di-set.

### Step 3.3: Test Bot

1. Buka Telegram
2. Cari: `@YourBotUsername` (sesuai nama bot kamu)
3. Ketik commands:

| Command | Response |
|---------|----------|
| `/start` | Info bot & daftar commands |
| `/price` | Harga BTC real-time |
| `/predict` | Prediksi AI + signal trading |
| `/sentiment` | Mood pasar |
| `/signals` | RSI, MA, dll |
| `/status` | Status sistem |

---

## BAGIAN 4: VERIFIKASI SISTEM

### Checklist Final

#### Netlify ✅
- [ ] Website bisa diakses
- [ ] Login berhasil (admin/Broken12#)
- [ ] Dashboard menampilkan harga BTC
- [ ] Chart tampil dengan benar

#### Appwrite ✅
- [ ] Database `bitcoin_db` ada
- [ ] 5 Collections sudah dibuat dengan attributes
- [ ] 6 Functions sudah deployed
- [ ] Cron schedules aktif

#### Telegram Bot ✅
- [ ] Webhook sudah di-set
- [ ] `/price` mengembalikan harga real
- [ ] `/predict` mengembalikan prediksi
- [ ] Notifikasi masuk ke chat ID 434699276

---

## BAGIAN 5: MONITORING & MAINTENANCE

### Cek Logs Function
1. Appwrite Console → Functions → Pilih function
2. Tab "Executions" → Lihat logs

### Cek Database
1. Appwrite Console → Databases → bitcoin_db
2. Pilih collection → Tab "Documents"

### Reset Webhook (jika error)
```
https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/deleteWebhook
```
Lalu set ulang webhook.

---

## TROUBLESHOOTING

### ❌ "Function execution failed"
- Cek Variables sudah benar
- Cek syntax error di code
- Lihat logs di tab Executions

### ❌ "Bot tidak merespon"
- Cek webhook sudah di-set
- Cek function `telegram_bot_handler` aktif
- Cek logs function

### ❌ "Dashboard kosong"
- Cek API CORS (buka console browser)
- Cek network requests
- Pastikan fetch ke CoinGecko/Binance berhasil

### ❌ "Database error"
- Cek Collection ID dan Database ID sesuai
- Cek permissions collection (Any = Read)
- Cek API Key valid

---

## RINGKASAN ENDPOINTS

| Service | URL |
|---------|-----|
| **Dashboard** | https://[nama].netlify.app |
| **Appwrite** | https://sgp.cloud.appwrite.io/v1 |
| **Telegram Bot** | https://t.me/[bot_username] |
| **CoinGecko API** | https://api.coingecko.com/api/v3 |
| **Binance API** | https://api.binance.com/api/v3 |

---

## BIAYA

| Service | Biaya |
|---------|-------|
| Netlify | **GRATIS** (100GB bandwidth/bulan) |
| Appwrite Cloud | **GRATIS** (75K executions/bulan) |
| Telegram Bot | **GRATIS** |
| CoinGecko API | **GRATIS** |
| Binance API | **GRATIS** |

**Total: $0/bulan** 🎉

---

## CONTACT & SUPPORT

- GitHub: https://github.com/dinoadi/predikoin
- Telegram: @434699276

⚠️ **DISCLAIMER**: Ini untuk edukasi. Bukan saran finansial. Investasi crypto berisiko tinggi.
