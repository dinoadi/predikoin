#!/bin/bash

# Complete deployment & testing guide

# ============================================
# PART 1: LOCAL SETUP
# ============================================

echo "📋 PART 1: LOCAL SETUP"
echo "===================="

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env dan isi dengan API keys Anda

# ============================================
# PART 2: APPWRITE SETUP
# ============================================

echo "📋 PART 2: APPWRITE SETUP"
echo "========================"

# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Initialize project
appwrite init

# ============================================
# PART 3: CREATE DATABASE COLLECTIONS
# ============================================

echo "📋 PART 3: CREATE COLLECTIONS"
echo "============================="

# Buka Appwrite Console untuk membuat collections:
# 1. price_data
# 2. sentiment_data
# 3. ta_alerts
# 4. predictions
# 5. notifications
#
# Atau gunakan Appwrite API untuk create programmatically
# Lihat database-schema.js untuk details

# ============================================
# PART 4: DEPLOY FUNCTIONS
# ============================================

echo "📋 PART 4: DEPLOY FUNCTIONS"
echo "============================"

# Deploy fetch_price
appwrite deploy functions fetch_price

# Deploy news_sentiment
appwrite deploy functions news_sentiment

# Deploy tradingview_webhook
appwrite deploy functions tradingview_webhook

# Deploy predict_bitcoin
appwrite deploy functions predict_bitcoin

# Deploy telegram_notif
appwrite deploy functions telegram_notif

# ============================================
# PART 5: CONFIGURE TRIGGERS
# ============================================

echo "📋 PART 5: CONFIGURE CRON TRIGGERS"
echo "======================================"

# Di Appwrite Console:
# 1. fetch_price: 0 * * * * (every hour)
# 2. news_sentiment: 0 */2 * * * (every 2 hours)
# 3. predict_bitcoin: 0 * * * * (every hour)

# ============================================
# PART 6: TEST FUNCTIONS LOCALLY
# ============================================

echo "📋 PART 6: TEST FUNCTIONS"
echo "=========================="

# Test 1: Fetch Price
curl -X POST http://localhost:3000/functions/fetch_price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{}'

# Test 2: News Sentiment
curl -X POST http://localhost:3000/functions/news_sentiment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{}'

# Test 3: TradingView Webhook
curl -X POST http://localhost:3000/functions/tradingview_webhook \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "ta_test_001",
    "signal": "RSI_BULLISH",
    "price": 42000,
    "indicator": "RSI",
    "weight": 0.15
  }'

# Test 4: Predict Bitcoin
curl -X POST http://localhost:3000/functions/predict_bitcoin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{}'

# Test 5: Telegram Notification
curl -X POST http://localhost:3000/functions/telegram_notif \
  -H "Content-Type: application/json" \
  -d '{
    "type": "alert",
    "data": {
      "title": "Test Alert",
      "message": "This is a test from deployment guide",
      "alertType": "INFO"
    }
  }'

# ============================================
# PART 7: CONFIGURE TRADINGVIEW WEBHOOK
# ============================================

echo "📋 PART 7: TRADINGVIEW WEBHOOK URL"
echo "====================================="

# Di TradingView Alert settings, set webhook URL ke:
# https://your-domain.com/functions/tradingview_webhook
#
# Contoh payload dari TradingView:
# {
#   "alert_id": "{{alert.id}}",
#   "signal": "RSI_BULLISH",
#   "price": "{{close}}",
#   "indicator": "RSI",
#   "weight": 0.15
# }

# ============================================
# PART 8: MONITOR LOGS
# ============================================

echo "📋 PART 8: MONITOR LOGS"
echo "======================="

# View logs di Appwrite Console atau gunakan CLI:
appwrite functions getFunctionLogs fetch_price
appwrite functions getFunctionLogs news_sentiment
appwrite functions getFunctionLogs predict_bitcoin

# ============================================
# PART 9: VERIFY TELEGRAM BOT
# ============================================

echo "📋 PART 9: VERIFY TELEGRAM"
echo "=========================="

# 1. Create Telegram bot via @BotFather
# 2. Get bot token
# 3. Get chat ID (send message ke bot, then check updates)
# 4. Update .env dengan values

# Test bot connection:
curl -s https://api.telegram.org/botYOUR_BOT_TOKEN/getMe | jq .

# ============================================
# PART 10: PRODUCTION DEPLOYMENT
# ============================================

echo "📋 PART 10: PRODUCTION"
echo "======================="

# Best practices:
# 1. Use environment variables for all secrets
# 2. Enable CORS on Appwrite
# 3. Set rate limits
# 4. Enable logging & monitoring
# 5. Use structured error handling
# 6. Test error scenarios
# 7. Monitor function performance
# 8. Set up alerts for failures

# ============================================
# TROUBLESHOOTING
# ============================================

echo "📋 TROUBLESHOOTING"
echo "=================="

# Problem: API Key rejected
# Solution: Check API key in .env, verify format

# Problem: Webhook not triggering
# Solution: Check TradingView webhook URL, verify request payload

# Problem: No data being fetched
# Solution: Verify API credentials working, check rate limits

# Problem: Telegram messages not sending
# Solution: Verify bot token valid, check chat ID, verify bot has permissions

echo ""
echo "✅ Deployment guide complete!"
echo "See README.md for additional details"
