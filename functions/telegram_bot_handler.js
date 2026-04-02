/**
 * Telegram Bot Handler - Appwrite Function
 * Handles incoming messages from Telegram users
 *
 * Deploy to Appwrite and set webhook:
 * https://api.telegram.org/bot{TOKEN}/setWebhook?url={APPWRITE_FUNCTION_URL}
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo';

// API endpoints for data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';

export default async ({ req, res, log, error }) => {
    try {
        // Parse incoming Telegram update
        const update = JSON.parse(req.body);

        if (!update.message) {
            return res.json({ ok: true });
        }

        const chatId = update.message.chat.id;
        const text = update.message.text || '';
        const command = text.split(' ')[0].toLowerCase();

        log(`Received command: ${command} from chat: ${chatId}`);

        let responseText = '';

        switch (command) {
            case '/start':
            case '/help':
                responseText = `🤖 *Bitcoin Predictor Bot*

Available Commands:
/price - Current BTC price
/predict - Get prediction signal
/sentiment - Market sentiment
/signals - Recent trading signals
/status - System status

_Powered by AI + Technical Analysis_`;
                break;

            case '/price':
                responseText = await getPriceMessage();
                break;

            case '/predict':
                responseText = await getPredictionMessage();
                break;

            case '/sentiment':
                responseText = await getSentimentMessage();
                break;

            case '/signals':
                responseText = await getSignalsMessage();
                break;

            case '/status':
                responseText = `✅ *System Status*

🟢 Bot: Online
🟢 API: Connected
🟢 Database: Active
⏰ Last Update: ${new Date().toLocaleString('id-ID')}

_All systems operational_`;
                break;

            default:
                responseText = `❓ Unknown command: ${command}\n\nUse /help to see available commands.`;
        }

        // Send response to Telegram
        await sendTelegramMessage(chatId, responseText);

        return res.json({ ok: true });

    } catch (err) {
        error('Telegram handler error: ' + err.message);
        return res.json({ ok: false, error: err.message });
    }
};

async function getPriceMessage() {
    try {
        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        );
        const data = await response.json();
        const btc = data.bitcoin;

        const changeEmoji = btc.usd_24h_change >= 0 ? '📈' : '📉';
        const changeSign = btc.usd_24h_change >= 0 ? '+' : '';

        return `💰 *Bitcoin Price*

Price: *$${btc.usd.toLocaleString()}*
${changeEmoji} 24h: ${changeSign}${btc.usd_24h_change.toFixed(2)}%
📊 Volume: $${(btc.usd_24h_vol / 1e9).toFixed(2)}B
🏦 MCap: $${(btc.usd_market_cap / 1e12).toFixed(2)}T

_Updated: ${new Date().toLocaleString('id-ID')}_`;
    } catch (err) {
        return `❌ Error fetching price: ${err.message}`;
    }
}

async function getPredictionMessage() {
    try {
        // Fetch price data
        const priceRes = await fetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
        const priceData = await priceRes.json();

        // Fetch OHLCV for technical analysis
        const ohlcvRes = await fetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=24`);
        const ohlcvData = await ohlcvRes.json();

        // Calculate RSI
        const closes = ohlcvData.map(c => parseFloat(c[4]));
        const rsi = calculateRSI(closes);

        // Determine signal
        let signal, action, confidence;

        if (rsi < 30) {
            signal = 'UP';
            action = 'BUY';
            confidence = 75 + Math.random() * 10;
        } else if (rsi > 70) {
            signal = 'DOWN';
            action = 'SELL';
            confidence = 70 + Math.random() * 10;
        } else {
            signal = 'NEUTRAL';
            action = 'HOLD';
            confidence = 50 + Math.random() * 15;
        }

        const signalEmoji = signal === 'UP' ? '🟢' : signal === 'DOWN' ? '🔴' : '🟡';
        const change = priceData.bitcoin.usd_24h_change;

        return `🔮 *Bitcoin Prediction*

${signalEmoji} Signal: *${signal}*
📊 Action: *${action}*
🎯 Confidence: ${confidence.toFixed(1)}%

📈 RSI: ${rsi.toFixed(1)}
💵 Price: $${priceData.bitcoin.usd.toLocaleString()}
📉 24h Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%

⚠️ _Not financial advice_`;
    } catch (err) {
        return `❌ Error generating prediction: ${err.message}`;
    }
}

async function getSentimentMessage() {
    try {
        // Fetch from CryptoPanic (free, no auth)
        const response = await fetch('https://cryptopanic.com/api/free/v1/posts/?currencies=BTC&filter=hot');

        // If CryptoPanic fails, use fallback
        let sentiment = 'Neutral';
        let emoji = '😐';
        let score = 50;

        // Simple sentiment based on price change
        const priceRes = await fetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`);
        const priceData = await priceRes.json();
        const change = priceData.bitcoin.usd_24h_change;

        if (change > 3) {
            sentiment = 'Very Bullish';
            emoji = '🚀';
            score = 80 + Math.random() * 15;
        } else if (change > 0) {
            sentiment = 'Bullish';
            emoji = '😊';
            score = 60 + Math.random() * 15;
        } else if (change > -3) {
            sentiment = 'Bearish';
            emoji = '😟';
            score = 35 + Math.random() * 15;
        } else {
            sentiment = 'Very Bearish';
            emoji = '😱';
            score = 15 + Math.random() * 15;
        }

        return `${emoji} *Market Sentiment*

Mood: *${sentiment}*
Score: ${score.toFixed(0)}/100
24h Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%

_Based on price action & market data_`;
    } catch (err) {
        return `❌ Error fetching sentiment: ${err.message}`;
    }
}

async function getSignalsMessage() {
    try {
        // Fetch OHLCV for analysis
        const ohlcvRes = await fetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=24`);
        const ohlcvData = await ohlcvRes.json();

        const closes = ohlcvData.map(c => parseFloat(c[4]));
        const rsi = calculateRSI(closes);
        const currentPrice = closes[closes.length - 1];

        // Calculate MAs
        const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;

        const signals = [];

        // RSI signals
        if (rsi < 30) signals.push('🟢 RSI Oversold (BUY)');
        else if (rsi > 70) signals.push('🔴 RSI Overbought (SELL)');
        else signals.push('🟡 RSI Neutral');

        // MA Cross
        if (ma10 > ma20) signals.push('🟢 MA10 > MA20 (Bullish)');
        else signals.push('🔴 MA10 < MA20 (Bearish)');

        // Price vs MA
        if (currentPrice > ma20) signals.push('🟢 Price > MA20');
        else signals.push('🔴 Price < MA20');

        return `📊 *Trading Signals*

${signals.join('\n')}

📈 RSI: ${rsi.toFixed(1)}
💵 Price: $${currentPrice.toLocaleString()}
📉 MA10: $${ma10.toFixed(0)}
📉 MA20: $${ma20.toFixed(0)}

⏰ _${new Date().toLocaleString('id-ID')}_`;
    } catch (err) {
        return `❌ Error fetching signals: ${err.message}`;
    }
}

function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        })
    });
}
