/**
 * Test files dan API request examples
 */

// Test 1: Fetch Price
TEST_FETCH_PRICE = {
  request: {
    method: 'POST',
    url: '/functions/fetch_price',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  expectedResponse: {
    success: true,
    data: {
      symbol: 'BTCUSDT',
      spotPrice: 42000,
      binanceCandles: 100,
      bybitCandles: 100,
      openInterest: 1234567,
      fundingRate: '0.0001'
    }
  }
};

// Test 2: News Sentiment
TEST_NEWS_SENTIMENT = {
  request: {
    method: 'POST',
    url: '/functions/news_sentiment'
  },
  expectedResponse: {
    success: true,
    data: {
      articlesCount: 50,
      averageSentiment: 0.25,
      label: 'positive'
    }
  }
};

// Test 3: TradingView Webhook
TEST_TRADINGVIEW_WEBHOOK = {
  request: {
    method: 'POST',
    url: '/functions/tradingview_webhook',
    body: {
      alert_id: 'ta_20240402_001',
      signal: 'RSI_BULLISH',
      price: 42000,
      indicator: 'RSI',
      weight: 0.15
    }
  },
  validSignals: [
    'RSI_BULLISH', 'RSI_BEARISH',
    'MA_CROSS_UP', 'MA_CROSS_DOWN',
    'BB_BREAKUP', 'BB_BREAKDOWN',
    'MACD_BULLISH', 'MACD_BEARISH'
  ]
};

// Test 4: Predict Bitcoin
TEST_PREDICT_BITCOIN = {
  request: {
    method: 'POST',
    url: '/functions/predict_bitcoin'
  },
  expectedResponse: {
    success: true,
    prediction: {
      currentPrice: 42000,
      prediction: 'UP', // UP, DOWN, NEUTRAL
      confidence: 0.75,
      shouldTrade: true,
      action: 'BUY',
      riskLevel: 'LOW'
    }
  }
};

// Test 5: Telegram Notification - Trade Signal
TEST_TELEGRAM_TRADE_SIGNAL = {
  request: {
    method: 'POST',
    url: '/functions/telegram_notif',
    body: {
      type: 'trade_signal',
      data: {
        tradeSignal: {
          action: 'BUY',
          confidence: 0.78,
          riskLevel: 'LOW',
          signals: ['RSI_OVERSOLD', 'MA_BULLISH']
        },
        prediction: {
          technicals: {
            rsi: 28,
            ma10: 41800,
            ma30: 42000
          }
        },
        currentPrice: 41500
      }
    }
  }
};

// Test 6: Telegram Notification - Price Analysis
TEST_TELEGRAM_PRICE_ANALYSIS = {
  request: {
    method: 'POST',
    url: '/functions/telegram_notif',
    body: {
      type: 'price_analysis',
      data: {
        technicals: {
          rsi: 45,
          ma10: 41800,
          ma30: 42000,
          maCross: 'bull',
          bollingerBands: {
            upper: 43000,
            middle: 42000,
            lower: 41000
          }
        },
        currentPrice: 41500
      }
    }
  }
};

// Test 7: Telegram Notification - Sentiment
TEST_TELEGRAM_SENTIMENT = {
  request: {
    method: 'POST',
    url: '/functions/telegram_notif',
    body: {
      type: 'sentiment_update',
      data: {
        sentiment: {
          label: 'positive',
          averageSentiment: 0.35,
          articlesCount: 45
        }
      }
    }
  }
};

// Test 8: Telegram Notification - Alert
TEST_TELEGRAM_ALERT = {
  request: {
    method: 'POST',
    url: '/functions/telegram_notif',
    body: {
      type: 'alert',
      data: {
        title: 'High Volatility Alert',
        message: 'Bitcoin volatility exceeded 5% in last hour',
        alertType: 'INFO' // INFO, SUCCESS, ERROR
      }
    }
  }
};

module.exports = {
  TEST_FETCH_PRICE,
  TEST_NEWS_SENTIMENT,
  TEST_TRADINGVIEW_WEBHOOK,
  TEST_PREDICT_BITCOIN,
  TEST_TELEGRAM_TRADE_SIGNAL,
  TEST_TELEGRAM_PRICE_ANALYSIS,
  TEST_TELEGRAM_SENTIMENT,
  TEST_TELEGRAM_ALERT
};
