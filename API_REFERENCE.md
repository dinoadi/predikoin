/**
 * Quick Reference - Function Payloads & Responses
 */

// ============================================
// 1️⃣ FETCH_PRICE
// ============================================
// Purpose: Fetch OHLCV + market data
// Trigger: Cron tiap 1 jam (0 * * * *)

FETCH_PRICE_RESPONSE = {
  success: true,
  message: 'Price fetch completed',
  data: {
    symbol: 'BTCUSDT',
    spotPrice: 42000.50,
    binanceCandles: 100,
    bybitCandles: 100,
    openInterest: 1234567800,
    fundingRate: '0.000123'
  },
  candles: {
    binance: [
      {
        timestamp: 1712090400000,
        open: 41900,
        high: 42050,
        low: 41850,
        close: 42000,
        volume: 1500
      }
    ],
    bybit: [
      // Similar structure
    ]
  }
};

// ============================================
// 2️⃣ NEWS_SENTIMENT
// ============================================
// Purpose: Analyze sentiment dari news
// Trigger: Cron tiap 2 jam (0 */2 * * *)

NEWS_SENTIMENT_RESPONSE = {
  success: true,
  data: {
    articlesCount: 50,
    averageSentiment: 0.25,
    label: 'positive', // positive, negative, neutral
    timestamp: '2024-04-02T10:00:00Z',
    sources: {
      cryptopanic: 25,
      newsapi: 25
    },
    topArticles: [
      {
        source: 'Reuters',
        score: 0.45,
        title: 'Bitcoin rallies after approval news'
      }
    ]
  }
};

// ============================================
// 3️⃣ TRADINGVIEW_WEBHOOK
// ============================================
// Purpose: Receive TA alerts dari TradingView
// Trigger: HTTP POST

TRADINGVIEW_WEBHOOK_REQUEST = {
  alert_id: 'ta_20240402_001',
  signal: 'RSI_BULLISH', // Valid signals below
  price: 42000,
  indicator: 'RSI',
  weight: 0.15 // Importance weight
};

TRADINGVIEW_SIGNALS = [
  'RSI_BULLISH',    // RSI < 30
  'RSI_BEARISH',    // RSI > 70
  'MA_CROSS_UP',    // MA10 > MA30
  'MA_CROSS_DOWN',  // MA10 < MA30
  'BB_BREAKUP',     // Price breaks upper band
  'BB_BREAKDOWN',   // Price breaks lower band
  'MACD_BULLISH',   // MACD positive
  'MACD_BEARISH'    // MACD negative
];

TRADINGVIEW_WEBHOOK_RESPONSE = {
  success: true,
  message: 'Alert received and processed',
  alert: {
    alertId: 'ta_20240402_001',
    signal: 'RSI_BULLISH',
    direction: 'UP',
    weight: 0.15,
    timestamp: '2024-04-02T10:00:00Z'
  }
};

// ============================================
// 4️⃣ PREDICT_BITCOIN
// ============================================
// Purpose: Generate price predictions
// Trigger: Cron tiap 1 jam (0 * * * *)

PREDICT_BITCOIN_RESPONSE = {
  success: true,
  prediction: {
    symbol: 'BTCUSDT',
    currentPrice: 42000,
    prediction: 'UP', // UP, DOWN, NEUTRAL
    confidence: 0.75,
    directionalConfidence: 0.65,
    shouldTrade: true,
    action: 'BUY', // BUY, SELL, HOLD
    riskLevel: 'LOW', // LOW, MEDIUM, HIGH
    signals: [
      'RSI_OVERSOLD',
      'MA_BULLISH',
      'OI_INCREASE',
      'SENTIMENT_POSITIVE'
    ],
    sentiment: 'positive',
    sentimentScore: 0.35,
    technicalData: {
      rsi: 28,
      ma10: 41800,
      ma30: 42000,
      maCross: 'bull'
    },
    timestamp: '2024-04-02T10:00:00Z'
  },
  tradeSignal: {
    action: 'BUY',
    confidence: 0.65,
    reasoning: '4 signals confirmed',
    riskLevel: 'LOW'
  }
};

// ============================================
// 5️⃣ TELEGRAM_NOTIF
// ============================================
// Purpose: Send notifications via Telegram
// Trigger: HTTP POST

// Type 1: Trade Signal
TELEGRAM_TRADE_SIGNAL_REQUEST = {
  type: 'trade_signal',
  data: {
    tradeSignal: {
      action: 'BUY',
      confidence: 0.78,
      riskLevel: 'LOW',
      reasoning: '4 signals confirmed',
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
};

// Type 2: Price Analysis
TELEGRAM_PRICE_ANALYSIS_REQUEST = {
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
};

// Type 3: Sentiment Update
TELEGRAM_SENTIMENT_REQUEST = {
  type: 'sentiment_update',
  data: {
    sentiment: {
      label: 'positive',
      averageSentiment: 0.35,
      articlesCount: 45
    }
  }
};

// Type 4: Alert
TELEGRAM_ALERT_REQUEST = {
  type: 'alert',
  data: {
    title: 'High Volatility Alert',
    message: 'Bitcoin volatility exceeded 5% in last hour',
    alertType: 'INFO' // INFO, SUCCESS, ERROR
  }
};

// Type 5: Raw Message
TELEGRAM_MESSAGE_REQUEST = {
  type: 'message',
  data: {
    message: '<b>Manual Update</b>\n\nCustom message here'
  }
};

TELEGRAM_NOTIF_RESPONSE = {
  success: true,
  message: 'trade_signal notification sent',
  messageId: 123456789,
  timestamp: '2024-04-02T10:00:00Z'
};

// ============================================
// CONFIDENCE & RISK LEVELS
// ============================================

CONFIDENCE_RANGES = {
  VERY_HIGH: 0.8, // >= 80%
  HIGH: 0.65,     // 65-80%
  MEDIUM: 0.5,    // 50-65%
  LOW: 0.33       // 33-50%
};

RISK_LEVELS = {
  LOW: 'Multiple confirming signals (>70% confidence)',
  MEDIUM: 'Some confirming signals (50-70% confidence)',
  HIGH: 'Single signal or low confidence (<50%)'
};

// ============================================
// SIGNAL WEIGHTS
// ============================================

SIGNAL_WEIGHTS = {
  RSI_SIGNAL: 0.15,           // Momentum
  MA_CROSS: 0.20,             // Trend
  BOLLINGER_BANDS: 0.10,      // Volatility
  OPEN_INTEREST: 0.15,        // Institutional pressure
  FUNDING_RATE: 0.10,         // Sentiment
  NEWS_SENTIMENT: 0.15,       // Market sentiment
  TRADINGVIEW_ALERT: 0.15     // TA confirmation
};

module.exports = {
  FETCH_PRICE_RESPONSE,
  NEWS_SENTIMENT_RESPONSE,
  TRADINGVIEW_SIGNALS,
  PREDICT_BITCOIN_RESPONSE,
  TELEGRAM_TRADE_SIGNAL_REQUEST,
  SIGNAL_WEIGHTS
};
