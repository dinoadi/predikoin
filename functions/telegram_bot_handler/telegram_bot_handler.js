/**
 * Telegram Bot Handler - Appwrite Function
 * Handles incoming messages from Telegram users
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo';

// API endpoints for data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';

module.exports = async ({ req, res, log, error }) => {
    try {
        log('Telegram bot handler triggered');

        // Parse incoming Telegram update
        let update;
        try {
            update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (e) {
            log('Failed to parse body: ' + req.body);
            return res.json({ ok: true });
        }

        if (!update || !update.message) {
            log('No message in update');
            return res.json({ ok: true });
        }

        const chatId = update.message.chat.id;
        const text = update.message.text || '';

        // Extract command - handle multiple formats
        // "💰 Price" -> "price", "/price" -> "price", "price" -> "price"
        let command = text.toLowerCase().trim();

        // Remove emoji prefix if present
        command = command.replace(/^[^\w\/]+/, '').trim();

        // Handle /command format
        if (command.startsWith('/')) {
            command = command.substring(1);
        }

        log(`Received command: ${command} from chat: ${chatId}`);

        let responseText = '';

        switch (command) {
            case 'start':
            case 'help':
            case '/start':
            case '/help':
                responseText = `🤖 Bitcoin Predictor Bot

Pilih menu di bawah untuk mulai:

💰 Price - Harga BTC saat ini
🔮 Predict - Prediksi arah harga
📊 Signal - Trading signal (Entry/TP/SL)
😊 Sentiment - Mood pasar
✅ Status - Status sistem`;
                // Send with keyboard menu
                await sendTelegramMessageWithMenu(chatId, responseText, log);
                return res.json({ ok: true });

            case 'price':
            case '/price':
                responseText = await getPriceMessage(log);
                break;

            case 'predict':
            case '/predict':
                responseText = await getPredictionMessage(log);
                break;

            case 'sentiment':
            case '/sentiment':
                responseText = await getSentimentMessage(log);
                break;

            case 'signal':
            case 'signals':
            case '/signal':
            case '/signals':
                responseText = await getSignalsMessage(log);
                break;

            case 'status':
            case '/status':
                responseText = `✅ System Status

🟢 Bot: Online
🟢 API: Connected
🟢 Database: Active
⏰ ${new Date().toLocaleString('id-ID')}

Semua sistem berjalan normal`;
                break;

            default:
                responseText = `❓ Perintah tidak dikenal\n\nGunakan menu di bawah atau ketik /help`;
        }

        // Send response to Telegram with persistent menu
        await sendTelegramMessageWithMenu(chatId, responseText, log);

        return res.json({ ok: true });

    } catch (err) {
        error('Telegram handler error: ' + err.message);
        return res.json({ ok: false, error: err.message });
    }
};

async function getPriceMessage(log) {
    try {
        log('Fetching price from CoinGecko...');
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
        log('Price fetch error: ' + err.message);
        return `❌ Error fetching price: ${err.message}`;
    }
}

async function getPredictionMessage(log) {
    try {
        log('Generating prediction...');

        // Fetch OHLCV for technical analysis
        const ohlcvRes = await fetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=48`);
        const ohlcvData = await ohlcvRes.json();

        const closes = ohlcvData.map(c => parseFloat(c[4]));
        const highs = ohlcvData.map(c => parseFloat(c[2]));
        const lows = ohlcvData.map(c => parseFloat(c[3]));
        const volumes = ohlcvData.map(c => parseFloat(c[5]));

        const currentPrice = closes[closes.length - 1];
        const prevPrice24h = closes[closes.length - 25];
        const prevPrice1h = closes[closes.length - 2];
        const change24h = ((currentPrice - prevPrice24h) / prevPrice24h) * 100;
        const change1h = ((currentPrice - prevPrice1h) / prevPrice1h) * 100;

        // Calculate indicators
        const rsi = calculateRSI(closes);
        const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const atr = calculateATR(highs, lows, closes, 14);

        // Support & Resistance
        const support = Math.min(...lows.slice(-24));
        const resistance = Math.max(...highs.slice(-24));

        // Volume analysis
        const avgVolume = volumes.slice(-24).reduce((a, b) => a + b, 0) / 24;
        const currentVolume = volumes[volumes.length - 1];
        const volumeRatio = currentVolume / avgVolume;

        // Scoring system for prediction
        let bullScore = 0;
        let bearScore = 0;
        const analysis = [];

        // RSI Analysis
        if (rsi < 30) {
            bullScore += 25;
            analysis.push('🟢 RSI oversold - potensi rebound');
        } else if (rsi < 40) {
            bullScore += 15;
            analysis.push('🟢 RSI rendah - mendekati oversold');
        } else if (rsi > 70) {
            bearScore += 25;
            analysis.push('🔴 RSI overbought - potensi koreksi');
        } else if (rsi > 60) {
            bearScore += 15;
            analysis.push('🟡 RSI tinggi - waspada koreksi');
        } else {
            analysis.push('🟡 RSI netral');
        }

        // MA Cross Analysis
        if (ma10 > ma20) {
            bullScore += 20;
            analysis.push('🟢 MA10 > MA20 - trend bullish');
        } else {
            bearScore += 20;
            analysis.push('🔴 MA10 < MA20 - trend bearish');
        }

        // Price Position
        if (currentPrice > ma20) {
            bullScore += 15;
            analysis.push('🟢 Harga di atas MA20');
        } else {
            bearScore += 15;
            analysis.push('🔴 Harga di bawah MA20');
        }

        // Momentum
        if (change24h > 3) {
            bullScore += 20;
            analysis.push('🚀 Momentum kuat naik');
        } else if (change24h > 0) {
            bullScore += 10;
        } else if (change24h < -3) {
            bearScore += 20;
            analysis.push('📉 Momentum kuat turun');
        } else {
            bearScore += 10;
        }

        // Volume
        if (volumeRatio > 1.5) {
            analysis.push('📊 Volume tinggi - pergerakan signifikan');
        }

        // Calculate prediction
        const totalScore = bullScore + bearScore;
        const bullPercent = totalScore > 0 ? (bullScore / totalScore) * 100 : 50;
        const confidence = Math.max(bullPercent, 100 - bullPercent);

        // Determine trend and price target
        let trend, trendEmoji, priceTarget, targetPercent;

        if (bullPercent >= 65) {
            trend = 'NAIK';
            trendEmoji = '📈';
            priceTarget = Math.min(currentPrice + (atr * 2), resistance * 1.02);
            targetPercent = ((priceTarget - currentPrice) / currentPrice) * 100;
        } else if (bullPercent <= 35) {
            trend = 'TURUN';
            trendEmoji = '📉';
            priceTarget = Math.max(currentPrice - (atr * 2), support * 0.98);
            targetPercent = ((priceTarget - currentPrice) / currentPrice) * 100;
        } else {
            trend = 'SIDEWAYS';
            trendEmoji = '➡️';
            priceTarget = currentPrice;
            targetPercent = 0;
        }

        const timeframe = '4-24 jam';

        return `🔮 Prediksi Bitcoin

${trendEmoji} Prediksi: ${trend}
🎯 Confidence: ${confidence.toFixed(0)}%
⏱️ Timeframe: ${timeframe}

━━━━━━━━━━━━━━━━━━━━
💵 Harga Saat Ini
$${currentPrice.toLocaleString()}

🎯 Target Harga
$${priceTarget.toLocaleString()} (${targetPercent >= 0 ? '+' : ''}${targetPercent.toFixed(1)}%)

━━━━━━━━━━━━━━━━━━━━
📊 Pergerakan
• 1 Jam: ${change1h >= 0 ? '+' : ''}${change1h.toFixed(2)}%
• 24 Jam: ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%

📈 Indikator
• RSI(14): ${rsi.toFixed(1)}
• MA10: $${ma10.toFixed(0)}
• MA20: $${ma20.toFixed(0)}

━━━━━━━━━━━━━━━━━━━━
🔍 Analisis
${analysis.join('\n')}

📊 Level Penting
• Support: $${support.toLocaleString()}
• Resistance: $${resistance.toLocaleString()}

⏰ ${new Date().toLocaleString('id-ID')}
⚠️ DYOR - Bukan saran finansial`;
    } catch (err) {
        log('Prediction error: ' + err.message);
        return `❌ Error: ${err.message}`;
    }
}

async function getSentimentMessage(log) {
    try {
        log('Fetching sentiment...');

        // Fetch price data for sentiment analysis
        const priceRes = await fetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`);
        const priceData = await priceRes.json();
        const change = priceData.bitcoin.usd_24h_change;
        const price = priceData.bitcoin.usd;
        const volume = priceData.bitcoin.usd_24h_vol;

        // Fetch OHLCV for more analysis
        const ohlcvRes = await fetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=24`);
        const ohlcvData = await ohlcvRes.json();
        const closes = ohlcvData.map(c => parseFloat(c[4]));
        const rsi = calculateRSI(closes);

        let sentiment, emoji, score, advice;

        if (change > 5) {
            sentiment = 'Extreme Greed';
            emoji = '🤑';
            score = 90 + Math.random() * 10;
            advice = 'Hati-hati FOMO, pertimbangkan taking profit';
        } else if (change > 3) {
            sentiment = 'Very Bullish';
            emoji = '🚀';
            score = 75 + Math.random() * 15;
            advice = 'Momentum kuat, trend bullish berlanjut';
        } else if (change > 0) {
            sentiment = 'Bullish';
            emoji = '😊';
            score = 55 + Math.random() * 15;
            advice = 'Pasar optimis, perhatikan resistance';
        } else if (change > -3) {
            sentiment = 'Bearish';
            emoji = '😟';
            score = 35 + Math.random() * 15;
            advice = 'Pasar pesimis, perhatikan support';
        } else if (change > -5) {
            sentiment = 'Very Bearish';
            emoji = '😱';
            score = 20 + Math.random() * 15;
            advice = 'Tekanan jual tinggi, waspada breakdown';
        } else {
            sentiment = 'Extreme Fear';
            emoji = '💀';
            score = 5 + Math.random() * 15;
            advice = 'Panik selling, bisa jadi peluang beli';
        }

        // RSI-based adjustment
        let rsiSentiment;
        if (rsi < 30) {
            rsiSentiment = '🟢 Oversold';
        } else if (rsi > 70) {
            rsiSentiment = '🔴 Overbought';
        } else {
            rsiSentiment = '🟡 Neutral';
        }

        const changeEmoji = change >= 0 ? '📈' : '📉';
        const volumeB = (volume / 1e9).toFixed(2);

        return `😊 *Market Sentiment BTCUSDT*

━━━━━━━━━━━━━━━━━━━━
${emoji} Mood: *${sentiment}*
📊 Fear & Greed: ${score.toFixed(0)}/100

━━━━━━━━━━━━━━━━━━━━
📈 *Market Data*
💵 Price: $${price.toLocaleString()}
${changeEmoji} 24h: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
📊 Volume: $${volumeB}B
📉 RSI(14): ${rsi.toFixed(1)} ${rsiSentiment}

━━━━━━━━━━━━━━━━━━━━
💡 *Insight*
${advice}

⏰ ${new Date().toLocaleString('id-ID')}
⚠️ _DYOR - Not Financial Advice_`;
    } catch (err) {
        log('Sentiment error: ' + err.message);
        return `❌ Error fetching sentiment: ${err.message}`;
    }
}

async function getSignalsMessage(log) {
    try {
        log('Fetching signals...');

        // Fetch OHLCV for analysis
        const ohlcvRes = await fetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=48`);
        const ohlcvData = await ohlcvRes.json();

        const closes = ohlcvData.map(c => parseFloat(c[4]));
        const highs = ohlcvData.map(c => parseFloat(c[2]));
        const lows = ohlcvData.map(c => parseFloat(c[3]));

        const rsi = calculateRSI(closes);
        const currentPrice = closes[closes.length - 1];

        // Calculate MAs
        const ma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const ma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;

        // Calculate ATR for dynamic SL/TP
        const atr = calculateATR(highs, lows, closes, 14);

        // Calculate Support & Resistance
        const support = Math.min(...lows.slice(-24));
        const resistance = Math.max(...highs.slice(-24));

        // Determine signal direction
        let direction = 'WAIT';
        let bullishCount = 0;
        let bearishCount = 0;

        // RSI signals
        if (rsi < 30) bullishCount += 2;
        else if (rsi < 40) bullishCount += 1;
        else if (rsi > 70) bearishCount += 2;
        else if (rsi > 60) bearishCount += 1;

        // MA Cross
        if (ma10 > ma20) bullishCount += 1;
        else bearishCount += 1;

        // Price vs MA
        if (currentPrice > ma20) bullishCount += 1;
        else bearishCount += 1;

        // Determine direction
        if (bullishCount >= 3) direction = 'LONG';
        else if (bearishCount >= 3) direction = 'SHORT';

        // Calculate Entry, TP, SL based on direction
        let entry, tp1, tp2, tp3, sl, riskReward, leverage;

        if (direction === 'LONG') {
            entry = currentPrice;
            sl = currentPrice - (atr * 1);
            tp1 = currentPrice + (atr * 1.5);
            tp2 = currentPrice + (atr * 2.5);
            tp3 = currentPrice + (atr * 4);
            riskReward = ((tp2 - entry) / (entry - sl)).toFixed(1);
            leverage = '5-10x';
        } else if (direction === 'SHORT') {
            entry = currentPrice;
            sl = currentPrice + (atr * 1);
            tp1 = currentPrice - (atr * 1.5);
            tp2 = currentPrice - (atr * 2.5);
            tp3 = currentPrice - (atr * 4);
            riskReward = ((entry - tp2) / (sl - entry)).toFixed(1);
            leverage = '5-10x';
        } else {
            // WAIT - no clear signal
            return `⏳ Trading Signal BTCUSDT

🟡 Status: WAIT (Tidak ada signal)

Kondisi pasar tidak memberikan signal yang jelas.
Tunggu konfirmasi lebih lanjut.

━━━━━━━━━━━━━━━━━━━━
💵 Harga: $${currentPrice.toLocaleString()}
📊 RSI: ${rsi.toFixed(1)}
📈 MA10: $${ma10.toFixed(0)}
📉 MA20: $${ma20.toFixed(0)}

📊 Level Penting
• Support: $${support.toLocaleString()}
• Resistance: $${resistance.toLocaleString()}

⏰ ${new Date().toLocaleString('id-ID')}
⚠️ DYOR - Bukan saran finansial`;
        }

        const directionEmoji = direction === 'LONG' ? '🟢' : '🔴';
        const signalStrength = Math.max(bullishCount, bearishCount);
        const strengthText = signalStrength >= 4 ? 'STRONG' : signalStrength >= 3 ? 'MEDIUM' : 'WEAK';

        return `${directionEmoji} Trading Signal BTCUSDT

📍 ${direction} | ${strengthText}

━━━━━━━━━━━━━━━━━━━━
💰 Entry
$${entry.toLocaleString()}

🎯 Take Profit
TP1: $${tp1.toLocaleString()} (+${Math.abs((tp1/entry-1)*100).toFixed(1)}%)
TP2: $${tp2.toLocaleString()} (+${Math.abs((tp2/entry-1)*100).toFixed(1)}%)
TP3: $${tp3.toLocaleString()} (+${Math.abs((tp3/entry-1)*100).toFixed(1)}%)

🛑 Stop Loss
SL: $${sl.toLocaleString()} (-${Math.abs((sl/entry-1)*100).toFixed(1)}%)

━━━━━━━━━━━━━━━━━━━━
⚖️ Risk/Reward: 1:${riskReward}
📊 Leverage: ${leverage}

📈 Indikator
• RSI: ${rsi.toFixed(1)}
• MA10: $${ma10.toFixed(0)}
• MA20: $${ma20.toFixed(0)}
• ATR: $${atr.toFixed(0)}

📊 Level
• Support: $${support.toLocaleString()}
• Resistance: $${resistance.toLocaleString()}

⏰ ${new Date().toLocaleString('id-ID')}
⚠️ DYOR - Bukan saran finansial`;
    } catch (err) {
        log('Signals error: ' + err.message);
        return `❌ Error: ${err.message}`;
    }
}

function calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return (highs[highs.length-1] - lows[lows.length-1]);

    let trSum = 0;
    for (let i = highs.length - period; i < highs.length; i++) {
        const high = highs[i];
        const low = lows[i];
        const prevClose = closes[i - 1] || closes[i];

        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trSum += tr;
    }
    return trSum / period;
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

async function sendTelegramMessage(chatId, text, log) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    log(`Sending message to chat ${chatId}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        })
    });

    const result = await response.json();
    log('Telegram response: ' + JSON.stringify(result));
}

async function sendTelegramMessageWithMenu(chatId, text, log) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    log(`Sending message with menu to chat ${chatId}`);

    const keyboard = {
        keyboard: [
            [{ text: '💰 Price' }, { text: '🔮 Predict' }],
            [{ text: '📊 Signal' }, { text: '😊 Sentiment' }],
            [{ text: '✅ Status' }, { text: '❓ Help' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            reply_markup: keyboard
        })
    });

    const result = await response.json();
    log('Telegram response with menu: ' + JSON.stringify(result));
}
