/**
 * Database Schema untuk Appwrite
 * Jalankan untuk membuat collections
 */

// Collection: price_data
PRICE_DATA_COLLECTION = {
  id: 'price_data',
  name: 'Price Data',
  attributes: [
    {
      type: 'string',
      key: 'symbol',
      title: 'Symbol',
      required: true
    },
    {
      type: 'float',
      key: 'spotPrice',
      title: 'Spot Price',
      required: true
    },
    {
      type: 'integer',
      key: 'binanceCandles',
      title: 'Binance Candles'
    },
    {
      type: 'integer',
      key: 'bybitCandles',
      title: 'Bybit Candles'
    },
    {
      type: 'float',
      key: 'openInterest',
      title: 'Open Interest'
    },
    {
      type: 'string',
      key: 'fundingRate',
      title: 'Funding Rate'
    },
    {
      type: 'datetime',
      key: 'timestamp',
      title: 'Timestamp'
    }
  ],
  indexes: [
    {
      type: 'key',
      attributes: ['symbol', 'timestamp'],
      name: 'symbol_timestamp_idx'
    }
  ]
};

// Collection: sentiment_data
SENTIMENT_DATA_COLLECTION = {
  id: 'sentiment_data',
  name: 'Sentiment Data',
  attributes: [
    {
      type: 'integer',
      key: 'articlesCount',
      title: 'Articles Count'
    },
    {
      type: 'float',
      key: 'averageSentiment',
      title: 'Average Sentiment',
      range: [-1, 1]
    },
    {
      type: 'string',
      key: 'label',
      title: 'Label', // positive, negative, neutral
      enum: ['positive', 'negative', 'neutral']
    },
    {
      type: 'datetime',
      key: 'timestamp',
      title: 'Timestamp'
    }
  ]
};

// Collection: ta_alerts
TA_ALERTS_COLLECTION = {
  id: 'ta_alerts',
  name: 'TradingView Alerts',
  attributes: [
    {
      type: 'string',
      key: 'alertId',
      title: 'Alert ID'
    },
    {
      type: 'string',
      key: 'signal',
      title: 'Signal',
      enum: [
        'RSI_BULLISH', 'RSI_BEARISH',
        'MA_CROSS_UP', 'MA_CROSS_DOWN',
        'BB_BREAKUP', 'BB_BREAKDOWN',
        'MACD_BULLISH', 'MACD_BEARISH'
      ]
    },
    {
      type: 'float',
      key: 'price',
      title: 'Price at Alert'
    },
    {
      type: 'string',
      key: 'direction',
      title: 'Direction',
      enum: ['UP', 'DOWN']
    },
    {
      type: 'float',
      key: 'weight',
      title: 'Signal Weight',
      range: [0, 1]
    },
    {
      type: 'datetime',
      key: 'timestamp',
      title: 'Timestamp'
    }
  ]
};

// Collection: predictions
PREDICTIONS_COLLECTION = {
  id: 'predictions',
  name: 'Price Predictions',
  attributes: [
    {
      type: 'string',
      key: 'symbol',
      title: 'Symbol'
    },
    {
      type: 'float',
      key: 'currentPrice',
      title: 'Current Price'
    },
    {
      type: 'string',
      key: 'prediction',
      title: 'Prediction',
      enum: ['UP', 'DOWN', 'NEUTRAL']
    },
    {
      type: 'float',
      key: 'confidence',
      title: 'Confidence',
      range: [0, 1]
    },
    {
      type: 'float',
      key: 'directionalConfidence',
      title: 'Directional Confidence'
    },
    {
      type: 'boolean',
      key: 'shouldTrade',
      title: 'Should Trade'
    },
    {
      type: 'string',
      key: 'action',
      title: 'Action',
      enum: ['BUY', 'SELL', 'HOLD']
    },
    {
      type: 'string',
      key: 'riskLevel',
      title: 'Risk Level',
      enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    {
      type: 'string',
      key: 'sentiment',
      title: 'Sentiment Label'
    },
    {
      type: 'float',
      key: 'sentimentScore',
      title: 'Sentiment Score'
    },
    {
      type: 'datetime',
      key: 'timestamp',
      title: 'Timestamp'
    }
  ]
};

// Collection: notifications
NOTIFICATIONS_COLLECTION = {
  id: 'notifications',
  name: 'Telegram Notifications',
  attributes: [
    {
      type: 'string',
      key: 'type',
      title: 'Notification Type',
      enum: ['trade_signal', 'price_analysis', 'sentiment_update', 'alert']
    },
    {
      type: 'integer',
      key: 'messageId',
      title: 'Telegram Message ID'
    },
    {
      type: 'boolean',
      key: 'success',
      title: 'Send Success'
    },
    {
      type: 'datetime',
      key: 'sentAt',
      title: 'Sent At'
    }
  ]
};

module.exports = {
  PRICE_DATA_COLLECTION,
  SENTIMENT_DATA_COLLECTION,
  TA_ALERTS_COLLECTION,
  PREDICTIONS_COLLECTION,
  NOTIFICATIONS_COLLECTION
};
