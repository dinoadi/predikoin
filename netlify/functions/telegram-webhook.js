/**
 * Netlify Serverless Function: telegram-webhook
 * Receives Telegram webhook POST and forwards to Appwrite telegram_bot_handler
 */

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
  const APPWRITE_PROJECT_ID = '69cd732d001088d78edf';
  const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

  try {
    const response = await fetch(
      `${APPWRITE_ENDPOINT}/functions/telegram_bot_handler/executions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-appwrite-project': APPWRITE_PROJECT_ID,
          'x-appwrite-key': APPWRITE_API_KEY,
        },
        body: JSON.stringify({
          body: event.body,
          path: '/',
          method: 'POST',
          headers: { 'content-type': 'application/json' },
        }),
      }
    );

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Webhook forward error:', err.message);
    return {
      statusCode: 200, // Always return 200 to Telegram to avoid retries
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
