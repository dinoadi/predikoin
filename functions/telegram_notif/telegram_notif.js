/**
 * Appwrite Function: telegram_notif
 * Trigger: HTTP trigger (setelah predict) atau dari event
 * Purpose: Send trading signals & alerts via Telegram
 */

const TelegramClient = require('./telegram-client');

module.exports = async function (req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(400).json({ error: 'Method not allowed' });
    }

    const telegram = new TelegramClient(
      process.env.TELEGRAM_BOT_TOKEN,
      process.env.TELEGRAM_CHAT_ID
    );

    const body = req.body;
    const { type, data } = body;

    if (!type || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type, data'
      });
    }

    let result;

    switch (type) {
      case 'trade_signal':
        result = await telegram.sendTradeSignal(
          data.tradeSignal,
          data.prediction,
          data.currentPrice
        );
        break;

      case 'price_analysis':
        result = await telegram.sendPriceAnalysis(
          data.technicals,
          data.currentPrice
        );
        break;

      case 'sentiment_update':
        result = await telegram.sendSentimentUpdate(data.sentiment);
        break;

      case 'alert':
        result = await telegram.sendAlert(
          data.title,
          data.message,
          data.alertType || 'INFO'
        );
        break;

      case 'message':
        result = await telegram.sendMessage(data.message);
        break;

      default:
        return res.status(400).json({
          error: `Unknown notification type: ${type}`,
          validTypes: ['trade_signal', 'price_analysis', 'sentiment_update', 'alert', 'message']
        });
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Telegram notification sent: ${type}`);

    return res.json({
      success: true,
      message: `${type} notification sent`,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Telegram Notification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
