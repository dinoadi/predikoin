# Bitcoin Price Prediction System

AI-powered Bitcoin price prediction system dengan multiple data sources dan Appwrite backend.

## 🏗️ Arsitektur

### Data Sources
- **Binance API**: OHLCV, spot price
- **Bybit API**: OHLCV + Open Interest + Funding Rate
- **CryptoPanic API**: Berita crypto
- **NewsAPI.org**: Berita keuangan global
- **TradingView**: TA Alerts via Webhook

### 5 Appwrite Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `fetch_price` | Cron tiap 1 jam | Fetch OHLCV data dari Binance & Bybit |
| `news_sentiment` | Cron tiap 2 jam | Analyze sentiment dari news |
| `tradingview_webhook` | HTTP trigger | Receive TradingView TA alerts |
| `predict_bitcoin` | Cron tiap 1 jam | Generate price predictions |
| `telegram_notif` | HTTP trigger | Send alerts via Telegram |

## 📋 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` ke `.env` dan isi dengan API keys:

```bash
cp .env.example .env
```

### 3. Deploy ke Appwrite

```bash
# Login ke Appwrite
appwrite login

# Deploy functions
appwrite deploy
```

## 🔧 Utilities

### DataFetcher
Fetch OHLCV dan market data dari exchange:

```javascript
const DataFetcher = require('./utils/data-fetcher');

const fetcher = new DataFetcher(binanceKey, binanceSecret, bybitKey, bybitSecret);

// Fetch OHLCV
const candles = await fetcher.fetchBinanceOHLCV('BTCUSDT', '1h', 100);

// Fetch Open Interest
const oi = await fetcher.fetchBybitOpenInterest('BTCUSDT');

// Fetch Funding Rate
const fr = await fetcher.fetchBybitFundingRate('BTCUSDT');
```

### SentimentAnalyzer
Analyze sentiment dari crypto & finance news:

```javascript
const SentimentAnalyzer = require('./utils/sentiment-analyzer');

const analyzer = new SentimentAnalyzer(cryptoPanicKey, newsApiKey);

// Fetch & analyze
const sentiment = await analyzer.analyzeNewsSentiment(articles);
// Returns: { averageSentiment: 0.23, label: 'positive', ... }
```

### PredictionModel
Generate trading signals:

```javascript
const PredictionModel = require('./utils/prediction-model');

const model = new PredictionModel(0.65); // threshold

const prediction = model.predictBitcoinPrice({
  ohlcv,
  openInterest,
  fundingRate,
  sentimentScore,
  taAlert
});

const tradeSignal = model.generateTradeSignal(prediction);
// Returns: { action: 'BUY', confidence: 0.78, riskLevel: 'LOW' }
```

### TelegramClient
Send notifications ke Telegram:

```javascript
const TelegramClient = require('./utils/telegram-client');

const telegram = new TelegramClient(botToken, chatId);

// Send trade signal
await telegram.sendTradeSignal(signal, prediction, price);

// Send price analysis
await telegram.sendPriceAnalysis(technicals, price);
```

## 🚀 Testing Functions

### Test fetch_price
```bash
curl -X POST http://localhost:3000/functions/fetch_price \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test predict_bitcoin
```bash
curl -X POST http://localhost:3000/functions/predict_bitcoin \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Test telegram_notif
```bash
curl -X POST http://localhost:3000/functions/telegram_notif \
  -H "Content-Type: application/json" \
  -d '{
    "type": "alert",
    "data": {
      "title": "Test Alert",
      "message": "This is a test",
      "alertType": "INFO"
    }
  }'
```

### Test tradingview_webhook
```bash
curl -X POST http://localhost:3000/functions/tradingview_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "ta_123456",
    "signal": "RSI_BULLISH",
    "price": 42000,
    "indicator": "RSI",
    "weight": 0.15
  }'
```

## 📊 Prediction Signals

### Technical Signals
- **RSI Oversold** (`RSI < 30`): Buy signal
- **RSI Overbought** (`RSI > 70`): Sell signal
- **MA Golden Cross** (`MA10 > MA30`): Bull signal
- **BB Breakout**: Price action signals

### Open Interest
- **OI Increase** + Bullish price: Strong buy
- **OI Decrease** + Bearish price: Strong sell

### Funding Rate
- **Positive FR**: Long-heavy, upside risk
- **Negative FR**: Short-heavy, downside risk

### Sentiment
- **Positive Score** (`> 0.3`): Buy signal
- **Negative Score** (`< -0.3`): Sell signal

## 🔐 API Keys Required

- **Binance**: API Key + Secret
- **Bybit**: API Key + Secret
- **CryptoPanic**: API Key (free tier available)
- **NewsAPI**: API Key (free tier available)
- **Telegram**: Bot Token + Chat ID

## 📝 Cron Schedules

```
FETCH_PRICE: 0 * * * *        (every hour)
NEWS_SENTIMENT: 0 */2 * * *   (every 2 hours)
PREDICT_BITCOIN: 0 * * * *    (every hour)
```

## 🐛 Troubleshooting

### API Errors
- Check API keys in `.env`
- Verify rate limits not exceeded
- Check internet connection

### Prediction Issues
- Need minimum 26 candles for indicators
- Ensure OHLCV data is valid
- Check sentiment score range (-1 to 1)

## 📚 Resources

- [Appwrite Docs](https://appwrite.io/docs)
- [Binance API](https://binance-docs.github.io/apidocs/)
- [Bybit API](https://bybit-exchange.github.io/docs/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## ⚠️ Disclaimer

Sistem ini hanya untuk educational purposes. Jangan gunakan untuk trading real money tanpa riset lebih lanjut.
# predikoin
