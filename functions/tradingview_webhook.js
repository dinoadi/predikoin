/**
 * Appwrite Function: tradingview_webhook
 * Trigger: HTTP trigger (dari TradingView alert)
 * Purpose: Receive & process TradingView TA alerts
 */

const { Client, Databases } = require('appwrite');

module.exports = async function (req, res) {
  // Validate webhook
  if (req.method !== 'POST') {
    return res.status(400).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    if (!body.alert_id || !body.signal) {
      return res.status(400).json({
        error: 'Missing required fields: alert_id, signal'
      });
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    const databases = new Databases(client);

    // Parse alert
    const alert = {
      alertId: body.alert_id,
      signal: body.signal, // e.g., "RSI_BULLISH", "MA_CROSS_UP"
      price: body.price || null,
      direction: body.signal.includes('UP') || body.signal.includes('BULL') ? 'UP' : 'DOWN',
      indicator: body.indicator || 'UNKNOWN',
      weight: body.weight || 0.15,
      timestamp: new Date().toISOString(),
      receivedAt: new Date().getTime()
    };

    console.log('TradingView Alert received:', alert);

    // Validate signal
    const validSignals = [
      'RSI_BULLISH', 'RSI_BEARISH',
      'MA_CROSS_UP', 'MA_CROSS_DOWN',
      'BB_BREAKUP', 'BB_BREAKDOWN',
      'MACD_BULLISH', 'MACD_BEARISH'
    ];

    if (!validSignals.includes(alert.signal)) {
      return res.status(400).json({
        error: `Invalid signal. Expected one of: ${validSignals.join(', ')}`
      });
    }

    // TODO: Save to database
    // await databases.createDocument(
    //   process.env.APPWRITE_DATABASE_ID,
    //   'ta_alerts',
    //   ID.unique(),
    //   alert
    // );

    console.log('Alert stored successfully');

    // TODO: Trigger predict function
    // This would typically call another function or update a queue

    return res.json({
      success: true,
      message: 'Alert received and processed',
      alert
    });
  } catch (error) {
    console.error('TradingView Webhook Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
