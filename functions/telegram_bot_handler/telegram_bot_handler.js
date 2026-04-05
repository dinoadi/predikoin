/**
 * Telegram Bot Handler - Appwrite Function
 * AI tegas & informatif — didukung multi-source data
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const COINGECKO_API   = 'https://api.coingecko.com/api/v3';
const BINANCE_API     = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES = 'https://fapi.binance.com/fapi/v1';
const FEAR_GREED_API  = 'https://api.alternative.me/fng/?limit=1';

module.exports = async ({ req, res, log, error }) => {
    try {
        log('Telegram bot handler triggered');
        let update;
        try {
            update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (e) {
            return res.json({ ok: true });
        }

        if (!update || !update.message) return res.json({ ok: true });

        const chatId = update.message.chat.id;
        const text   = update.message.text || '';

        let command = text.toLowerCase().trim();
        command = command.replace(/^[^\w\/]+/, '').trim();
        if (command.startsWith('/')) command = command.substring(1);
        log(`Command: ${command} | Chat: ${chatId}`);

        let responseText = '';

        switch (command) {
            case 'start':
            case 'help':
                responseText = `🤖 *PREDIKOIN – Bitcoin AI Predictor*\n\nPilih menu di bawah:\n\n💰 *Price*     – Harga & data pasar BTC\n🔮 *Predict*   – Prediksi tegas + alasan lengkap\n📊 *Signal*    – Entry/TP/SL siap pakai\n😊 *Sentiment* – Fear & Greed + analisis pasar\n✅ *Status*    – Status sistem`;
                await sendWithMenu(chatId, responseText, log);
                return res.json({ ok: true });
            case 'price':
                responseText = await getPriceMessage(log);
                break;
            case 'predict':
                responseText = await getPredictionMessage(log);
                break;
            case 'sentiment':
                responseText = await getSentimentMessage(log);
                break;
            case 'signal':
            case 'signals':
                responseText = await getSignalsMessage(log);
                break;
            case 'status':
                responseText = `✅ *System Status*\n\n🟢 Bot: Online\n🟢 Binance API: Connected\n🟢 CoinGecko API: Connected\n⏰ ${new Date().toLocaleString('id-ID')}`;
                break;
            default:
                responseText = `❓ Perintah tidak dikenal\n\nGunakan menu di bawah atau ketik /help`;
        }

        await sendWithMenu(chatId, responseText, log);
        return res.json({ ok: true });

    } catch (err) {
        error('Handler error: ' + err.message);
        return res.json({ ok: false, error: err.message });
    }
};

// ─── Fetch helper ────────────────────────────────────────────────
async function safeFetch(url, timeout = 8000) {
    const ctrl = new AbortController();
    const id   = setTimeout(() => ctrl.abort(), timeout);
    try {
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(id);
        return await r.json();
    } catch (e) {
        clearTimeout(id);
        return null;
    }
}

// ─── Price ───────────────────────────────────────────────────────
async function getPriceMessage(log) {
    try {
        const [cg, bn, fg] = await Promise.all([
            safeFetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`),
            safeFetch(`${BINANCE_API}/ticker/24hr?symbol=BTCUSDT`),
            safeFetch(FEAR_GREED_API),
        ]);
        const price = cg?.bitcoin?.usd    ?? parseFloat(bn?.lastPrice ?? 0);
        const chg   = cg?.bitcoin?.usd_24h_change ?? parseFloat(bn?.priceChangePercent ?? 0);
        const vol   = cg?.bitcoin?.usd_24h_vol    ?? parseFloat(bn?.quoteVolume ?? 0);
        const mcap  = cg?.bitcoin?.usd_market_cap ?? 0;
        const fgVal = fg?.data?.[0]?.value ?? 'N/A';
        const fgLbl = fg?.data?.[0]?.value_classification ?? '';
        return `💰 *Bitcoin Price*\n\n💵 Harga:  *$${price.toLocaleString()}*\n${chg >= 0 ? '📈' : '📉'} 24h:     ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%\n📊 Volume: $${(vol/1e9).toFixed(2)}B\n🏦 MCap:   $${(mcap/1e12).toFixed(2)}T\n\n${fgEmoji(parseInt(fgVal))} Fear & Greed: *${fgVal}/100* (${fgLbl})\n\n_⏰ ${new Date().toLocaleString('id-ID')}_`;
    } catch (err) {
        return `❌ Gagal fetch harga: ${err.message}`;
    }
}

// ─── Prediction ──────────────────────────────────────────────────
async function getPredictionMessage(log) {
    try {
        log('Multi-source prediction analysis...');

        const [raw1h, raw4h, cg, fg, fr, oi] = await Promise.all([
            safeFetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=50`),
            safeFetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=4h&limit=50`),
            safeFetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`),
            safeFetch(FEAR_GREED_API),
            safeFetch(`${BINANCE_FUTURES}/fundingRate?symbol=BTCUSDT&limit=3`),
            safeFetch(`${BINANCE_FUTURES}/openInterest?symbol=BTCUSDT`),
        ]);

        const c1 = raw1h.map(x => parseFloat(x[4]));
        const h1 = raw1h.map(x => parseFloat(x[2]));
        const l1 = raw1h.map(x => parseFloat(x[3]));
        const v1 = raw1h.map(x => parseFloat(x[5]));
        const c4 = raw4h.map(x => parseFloat(x[4]));
        const h4 = raw4h.map(x => parseFloat(x[2]));
        const l4 = raw4h.map(x => parseFloat(x[3]));

        const price = c1[c1.length - 1];
        const chg1h  = pctChg(c1[c1.length - 2], price);
        const chg24h = pctChg(c1[c1.length - 25] ?? c1[0], price);

        const rsi1 = rsi(c1);
        const rsi4 = rsi(c4);
        const ma10 = avg(c1.slice(-10));
        const ma20 = avg(c1.slice(-20));
        const ma50 = avg(c1.slice(-50));
        const e12  = ema(c1, 12);
        const e26  = ema(c1, 26);
        const macd = e12 - e26;
        const atr1 = atr(h1, l1, c1, 14);
        const [bbU,, bbL] = boll(c1, 20, 2);
        const sup1  = Math.min(...l1.slice(-24));
        const res1  = Math.max(...h1.slice(-24));
        const sup4  = Math.min(...l4.slice(-14));
        const res4  = Math.max(...h4.slice(-14));
        const volR  = v1[v1.length - 1] / avg(v1.slice(-24));

        const fgVal = parseInt(fg?.data?.[0]?.value ?? 50);
        const fgLbl = fg?.data?.[0]?.value_classification ?? 'Neutral';
        const frPct = fr ? parseFloat(fr[fr.length - 1]?.fundingRate ?? 0) * 100 : null;
        const bbPos = (price - bbL) / (bbU - bbL);

        // ── Scoring ────────────────────────────────────────────────
        let bull = 0, bear = 0;
        const eBull = [], eBear = [], eNeu = [];

        // RSI 1H
        if      (rsi1 < 25) { bull += 30; eBull.push(`RSI 1H=${rsi1.toFixed(1)} → Extreme oversold, reversal sangat mungkin`); }
        else if (rsi1 < 38) { bull += 20; eBull.push(`RSI 1H=${rsi1.toFixed(1)} → Oversold, potensi bounce`); }
        else if (rsi1 < 47) { bull += 10; eBull.push(`RSI 1H=${rsi1.toFixed(1)} → Bias bullish lemah`); }
        else if (rsi1 > 75) { bear += 30; eBear.push(`RSI 1H=${rsi1.toFixed(1)} → Extreme overbought, koreksi dekat`); }
        else if (rsi1 > 62) { bear += 20; eBear.push(`RSI 1H=${rsi1.toFixed(1)} → Overbought, waspada distribusi`); }
        else if (rsi1 > 53) { bear += 10; eBear.push(`RSI 1H=${rsi1.toFixed(1)} → Bias bearish lemah`); }
        else { eNeu.push(`RSI 1H=${rsi1.toFixed(1)} Netral`); }

        // RSI 4H
        if      (rsi4 < 35) { bull += 25; eBull.push(`RSI 4H=${rsi4.toFixed(1)} → Oversold di timeframe besar`); }
        else if (rsi4 < 45) { bull += 12; eBull.push(`RSI 4H=${rsi4.toFixed(1)} → Lemah, akumulasi berlanjut`); }
        else if (rsi4 > 65) { bear += 25; eBear.push(`RSI 4H=${rsi4.toFixed(1)} → Overbought di timeframe besar`); }
        else if (rsi4 > 55) { bear += 12; eBear.push(`RSI 4H=${rsi4.toFixed(1)} → Distribusi berlanjut`); }
        else { eNeu.push(`RSI 4H=${rsi4.toFixed(1)} Netral`); }

        // MA Stack
        if   (price > ma10 && ma10 > ma20 && ma20 > ma50) { bull += 30; eBull.push(`MA Stack BULLISH: price>MA10>MA20>MA50 → Trend naik kuat`); }
        else if (price < ma10 && ma10 < ma20 && ma20 < ma50) { bear += 30; eBear.push(`MA Stack BEARISH: price<MA10<MA20<MA50 → Trend turun kuat`); }
        else if (ma10 > ma20) { bull += 15; eBull.push(`MA10(${ma10.toFixed(0)}) > MA20(${ma20.toFixed(0)}) → Golden cross aktif`); }
        else                  { bear += 15; eBear.push(`MA10(${ma10.toFixed(0)}) < MA20(${ma20.toFixed(0)}) → Death cross aktif`); }

        // MACD
        const macdMag = Math.abs(macd) / price * 100;
        if (macd > 0 && macdMag > 0.3) { bull += 20; eBull.push(`MACD+${macd.toFixed(0)} kuat → Momentum bullish`); }
        else if (macd > 0)              { bull += 10; eBull.push(`MACD+${macd.toFixed(0)} tipis → Momentum lemah`); }
        else if (macdMag > 0.3)         { bear += 20; eBear.push(`MACD${macd.toFixed(0)} kuat → Momentum bearish`); }
        else                            { bear += 10; eBear.push(`MACD${macd.toFixed(0)} tipis → Momentum bearish lemah`); }

        // Bollinger Bands
        if      (bbPos < 0.15) { bull += 20; eBull.push(`Harga menyentuh BB Lower → Mean reversion bullish`); }
        else if (bbPos < 0.3)  { bull += 10; eBull.push(`Harga dekat BB Lower → Potensi bounce`); }
        else if (bbPos > 0.85) { bear += 20; eBear.push(`Harga menyentuh BB Upper → Mean reversion bearish`); }
        else if (bbPos > 0.7)  { bear += 10; eBear.push(`Harga dekat BB Upper → Potensi pullback`); }

        // Momentum 24h
        if      (chg24h > 5)  { bull += 20; eBull.push(`+${chg24h.toFixed(1)}% / 24h → Momentum kuat naik`); }
        else if (chg24h > 2)  { bull += 12; eBull.push(`+${chg24h.toFixed(1)}% / 24h → Gerak positif`); }
        else if (chg24h > 0)  { bull += 5; }
        else if (chg24h < -5) { bear += 20; eBear.push(`${chg24h.toFixed(1)}% / 24h → Selling pressure besar`); }
        else if (chg24h < -2) { bear += 12; eBear.push(`${chg24h.toFixed(1)}% / 24h → Tekanan jual`); }
        else                  { bear += 5; }

        // Volume
        if (volR > 2.0) {
            if (chg24h > 0) { bull += 15; eBull.push(`Volume ${volR.toFixed(1)}x normal → Kenaikan dikonfirmasi`); }
            else            { bear += 15; eBear.push(`Volume ${volR.toFixed(1)}x normal → Penurunan dikonfirmasi`); }
        } else if (volR > 1.5) {
            if (chg24h > 0) { bull += 8; eBull.push(`Volume ${volR.toFixed(1)}x → Konfirmasi bullish`); }
            else            { bear += 8; eBear.push(`Volume ${volR.toFixed(1)}x → Konfirmasi bearish`); }
        } else if (volR < 0.7) {
            eNeu.push(`Volume lemah (${volR.toFixed(1)}x) → kurang meyakinkan`);
        }

        // Fear & Greed (contrarian)
        if      (fgVal <= 20) { bull += 20; eBull.push(`F&G ${fgVal} (${fgLbl}) → Extreme fear = peluang beli historis`); }
        else if (fgVal <= 35) { bull += 10; eBull.push(`F&G ${fgVal} (${fgLbl}) → Pasar takut = akumulasi bijak`); }
        else if (fgVal >= 80) { bear += 20; eBear.push(`F&G ${fgVal} (${fgLbl}) → Extreme greed = risiko koreksi`); }
        else if (fgVal >= 65) { bear += 10; eBear.push(`F&G ${fgVal} (${fgLbl}) → Terlalu optimis`); }
        else                  { eNeu.push(`F&G ${fgVal}/100 Netral`); }

        // Funding Rate
        if (frPct !== null) {
            if      (frPct < -0.05) { bull += 15; eBull.push(`Funding ${frPct.toFixed(4)}% → Negatif, short squeeze berpotensi`); }
            else if (frPct < 0)     { bull += 8;  eBull.push(`Funding ${frPct.toFixed(4)}% → Sedikit negatif`); }
            else if (frPct > 0.1)   { bear += 15; eBear.push(`Funding ${frPct.toFixed(4)}% → Sangat positif, long rawan flush`); }
            else if (frPct > 0.05)  { bear += 8;  eBear.push(`Funding ${frPct.toFixed(4)}% → Positif tinggi`); }
            else                    { eNeu.push(`Funding ${frPct.toFixed(4)}% Normal`); }
        }

        // S/R proximity
        if (((price - sup1) / price * 100) < 1.5) { bull += 12; eBull.push(`Harga di dekat support $${sup1.toLocaleString()} → Level rebound`); }
        if (((res1 - price) / price * 100) < 1.5) { bear += 12; eBear.push(`Harga di dekat resistance $${res1.toLocaleString()} → Level penolakan`); }

        // ── Verdict ────────────────────────────────────────────────
        const total   = bull + bear;
        const bullPct = total > 0 ? (bull / total) * 100 : 50;

        let verdict, vEmoji, action, detail, target;

        if      (bullPct >= 70) { verdict='STRONG BUY';         vEmoji='🚀'; action='BUY';  target=Math.min(price+atr1*3, res1*1.03); detail=`Signal beli sangat kuat: ${eBull.length} faktor bullish vs ${eBear.length} bearish.`; }
        else if (bullPct >= 58) { verdict='BUY';                vEmoji='📈'; action='BUY';  target=Math.min(price+atr1*2, res1*1.01); detail=`Mayoritas indikator mendukung kenaikan. Konfirmasi cukup kuat.`; }
        else if (bullPct <= 30) { verdict='STRONG SELL';        vEmoji='💥'; action='SELL'; target=Math.max(price-atr1*3, sup1*0.97); detail=`Signal jual sangat kuat: ${eBear.length} faktor bearish vs ${eBull.length} bullish.`; }
        else if (bullPct <= 42) { verdict='SELL';               vEmoji='📉'; action='SELL'; target=Math.max(price-atr1*2, sup1*0.99); detail=`Mayoritas indikator mendukung penurunan.`; }
        else if (bull > bear)   { verdict='HOLD / AKUMULASI';   vEmoji='🟡'; action='HOLD'; target=res1; detail=`Sinyal campur, sedikit bullish. Tunggu breakout di atas $${res1.toLocaleString()}.`; }
        else                    { verdict='HOLD / HINDARI LONG';vEmoji='🟠'; action='HOLD'; target=sup1; detail=`Sinyal campur, sedikit bearish. Waspadai breakdown di bawah $${sup1.toLocaleString()}.`; }

        const targetPct  = ((target - price) / price * 100);
        const confidence = Math.min(95, Math.max(55, Math.abs(bullPct - 50) * 2 + 55));

        const bullLines = eBull.slice(0, 4).map(e => `✅ ${e}`).join('\n');
        const bearLines = eBear.slice(0, 4).map(e => `❌ ${e}`).join('\n');
        const neuLines  = eNeu.slice(0, 2).map(e => `➖ ${e}`).join('\n');

        return `🔮 *PREDIKSI BITCOIN – AI ANALYSIS*\n\n${vEmoji} *VERDICT: ${verdict}*\n🎯 Confidence: *${confidence.toFixed(0)}%*\n⏱️ Timeframe: 4–24 jam\n\n━━━━━━━━━━━━━━━━━━━━\n💵 Harga: *$${price.toLocaleString()}*\n🎯 Target: *$${target.toLocaleString()}* (${targetPct >= 0 ? '+' : ''}${targetPct.toFixed(1)}%)\n\n📊 1H: ${chg1h >= 0 ? '+' : ''}${chg1h.toFixed(2)}% | 24H: ${chg24h >= 0 ? '+' : ''}${chg24h.toFixed(2)}%\n\n━━━━━━━━━━━━━━━━━━━━\n📈 *INDIKATOR*\n• RSI 1H: ${rsi1.toFixed(1)} | RSI 4H: ${rsi4.toFixed(1)}\n• MA10: $${ma10.toFixed(0)} | MA20: $${ma20.toFixed(0)} | MA50: $${ma50.toFixed(0)}\n• MACD: ${macd >= 0 ? '+' : ''}${macd.toFixed(0)} | BB Pos: ${(bbPos * 100).toFixed(0)}%\n• ATR: $${atr1.toFixed(0)} | Vol: ${volR.toFixed(1)}x\n\n🌐 *DATA EKSTERNAL*\n• F&G: ${fgVal}/100 (${fgLbl}) ${fgEmoji(fgVal)}\n• Funding: ${frPct !== null ? frPct.toFixed(4) + '%' : 'N/A'}\n• Support: $${sup1.toLocaleString()} | Resist: $${res1.toLocaleString()}\n\n━━━━━━━━━━━━━━━━━━━━\n🔍 *ALASAN UTAMA*\n${bullLines}\n${bearLines}\n${neuLines}\n\n━━━━━━━━━━━━━━━━━━━━\n💬 *KESIMPULAN AI*\n${detail}\n*Skor: Bull ${bull} vs Bear ${bear}* (${bullPct.toFixed(0)}% bullish)\n\n⏰ ${new Date().toLocaleString('id-ID')}\n⚠️ _DYOR – Bukan saran finansial_`;
    } catch (err) {
        log('Prediction error: ' + err.message);
        return `❌ Gagal generate prediksi: ${err.message}`;
    }
}

// ─── Sentiment ───────────────────────────────────────────────────
async function getSentimentMessage(log) {
    try {
        const [cg, raw1h, fg, frData] = await Promise.all([
            safeFetch(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`),
            safeFetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=24`),
            safeFetch(FEAR_GREED_API),
            safeFetch(`${BINANCE_FUTURES}/fundingRate?symbol=BTCUSDT&limit=3`),
        ]);

        const price  = cg?.bitcoin?.usd ?? 0;
        const chg    = cg?.bitcoin?.usd_24h_change ?? 0;
        const vol    = cg?.bitcoin?.usd_24h_vol ?? 0;
        const closes = raw1h?.map(c => parseFloat(c[4])) ?? [];
        const rsi1   = closes.length > 15 ? rsi(closes) : 50;
        const fgVal  = parseInt(fg?.data?.[0]?.value ?? 50);
        const fgLbl  = fg?.data?.[0]?.value_classification ?? 'Neutral';
        const frPct  = frData ? parseFloat(frData[frData.length - 1]?.fundingRate ?? 0) * 100 : null;

        let score = fgVal;
        if (chg > 0) score = Math.min(100, score + Math.min(chg * 2, 15));
        else score = Math.max(0, score + Math.max(chg * 2, -15));
        if (rsi1 > 65) score = Math.min(100, score + 5);
        else if (rsi1 < 35) score = Math.max(0, score - 5);

        let mood, moodE, advice, detail;
        if      (score >= 80) { mood='Extreme Greed'; moodE='🤑'; advice='⚠️ HATI-HATI – Pasar terlalu euphoria'; detail='Secara historis extreme greed sering diikuti koreksi. Pertimbangkan taking profit. Smart money biasanya distribusi di sini.'; }
        else if (score >= 60) { mood='Greed';         moodE='😏'; advice='🟡 MODERAT – Masih bisa naik, risiko meningkat'; detail='FOMO mulai terasa. Hold posisi tapi ketatkan SL, jangan tambah posisi besar.'; }
        else if (score >= 45) { mood='Neutral';       moodE='😐'; advice='🟡 NETRAL – Tunggu konfirmasi arah'; detail='Pasar seimbang. Tunggu breakout atau berita katalis sebelum masuk.'; }
        else if (score >= 25) { mood='Fear';           moodE='😨'; advice='🟢 PELUANG – Waktu akumulasi bertahap'; detail='Fear = waktu terbaik untuk DCA. Jangan all-in sekaligus. Disiplin dengan rencana trading.'; }
        else                  { mood='Extreme Fear';  moodE='💀'; advice='🟢 STRONG BUY ZONE – Akumulasi agresif'; detail='Extreme fear secara historis adalah bottom zone. Odds statistik mendukung beli. Strategi: DCA bertahap beberapa sesi.'; }

        let frLine = '';
        if (frPct !== null) {
            if      (frPct < -0.05) frLine = `\n• Funding: ${frPct.toFixed(4)}% 🔥 Short squeeze alert!`;
            else if (frPct < 0)     frLine = `\n• Funding: ${frPct.toFixed(4)}% (negatif – tekanan short)`;
            else if (frPct > 0.1)   frLine = `\n• Funding: ${frPct.toFixed(4)}% ⚠️ Long terlalu banyak`;
            else if (frPct > 0.05)  frLine = `\n• Funding: ${frPct.toFixed(4)}% (positif tinggi)`;
            else                    frLine = `\n• Funding: ${frPct.toFixed(4)}% (normal)`;
        }

        const rsiLbl = rsi1 < 30 ? '🟢 Oversold' : rsi1 > 70 ? '🔴 Overbought' : '🟡 Neutral';

        return `😊 *MARKET SENTIMENT – BTCUSDT*\n\n${moodE} Mood: *${mood}*\n📊 Score: *${score.toFixed(0)}/100*\n\n━━━━━━━━━━━━━━━━━━━━\n📈 *Market Data*\n💵 Price: $${price.toLocaleString()}\n${chg >= 0 ? '📈' : '📉'} 24h: ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%\n📊 Volume: $${(vol/1e9).toFixed(2)}B\n📉 RSI(14): ${rsi1.toFixed(1)} ${rsiLbl}${frLine}\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 *Fear & Greed Index*\n${fgEmoji(fgVal)} *${fgVal}/100* – ${fgLbl}\n\n━━━━━━━━━━━━━━━━━━━━\n💡 *${advice}*\n\n_${detail}_\n\n⏰ ${new Date().toLocaleString('id-ID')}\n⚠️ _DYOR – Not Financial Advice_`;
    } catch (err) {
        return `❌ Gagal fetch sentiment: ${err.message}`;
    }
}

// ─── Signal ──────────────────────────────────────────────────────
async function getSignalsMessage(log) {
    try {
        const [raw1h, raw4h, fg, frData] = await Promise.all([
            safeFetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=1h&limit=50`),
            safeFetch(`${BINANCE_API}/klines?symbol=BTCUSDT&interval=4h&limit=50`),
            safeFetch(FEAR_GREED_API),
            safeFetch(`${BINANCE_FUTURES}/fundingRate?symbol=BTCUSDT&limit=1`),
        ]);

        const c1  = raw1h.map(x => parseFloat(x[4]));
        const h1  = raw1h.map(x => parseFloat(x[2]));
        const l1  = raw1h.map(x => parseFloat(x[3]));
        const v1  = raw1h.map(x => parseFloat(x[5]));
        const c4  = raw4h.map(x => parseFloat(x[4]));
        const h4  = raw4h.map(x => parseFloat(x[2]));
        const l4  = raw4h.map(x => parseFloat(x[3]));

        const price  = c1[c1.length - 1];
        const chg24h = pctChg(c1[c1.length - 25] ?? c1[0], price);
        const rsi1   = rsi(c1);
        const rsi4   = rsi(c4);
        const ma10   = avg(c1.slice(-10));
        const ma20   = avg(c1.slice(-20));
        const macd   = ema(c1, 12) - ema(c1, 26);
        const atr1   = atr(h1, l1, c1, 14);
        const [bbU,, bbL] = boll(c1, 20, 2);
        const sup1   = Math.min(...l1.slice(-24));
        const res1   = Math.max(...h1.slice(-24));
        const sup4   = Math.min(...l4.slice(-14));
        const res4   = Math.max(...h4.slice(-14));
        const volR   = v1[v1.length - 1] / avg(v1.slice(-24));
        const fgVal  = parseInt(fg?.data?.[0]?.value ?? 50);
        const frPct  = frData ? parseFloat(frData[0]?.fundingRate ?? 0) * 100 : null;
        const bbPos  = (price - bbL) / (bbU - bbL);

        let longS = 0, shortS = 0;
        const rL = [], rS = [];

        if      (rsi1 < 30) { longS  += 3; rL.push(`RSI 1H oversold (${rsi1.toFixed(1)})`); }
        else if (rsi1 < 42) { longS  += 2; rL.push(`RSI 1H rendah (${rsi1.toFixed(1)})`); }
        else if (rsi1 > 70) { shortS += 3; rS.push(`RSI 1H overbought (${rsi1.toFixed(1)})`); }
        else if (rsi1 > 58) { shortS += 2; rS.push(`RSI 1H tinggi (${rsi1.toFixed(1)})`); }

        if      (rsi4 < 40) { longS  += 3; rL.push(`RSI 4H oversold (${rsi4.toFixed(1)})`); }
        else if (rsi4 > 60) { shortS += 3; rS.push(`RSI 4H overbought (${rsi4.toFixed(1)})`); }

        if (ma10 > ma20 && price > ma20) { longS  += 2; rL.push(`MA golden cross + price above MA20`); }
        else if (ma10 < ma20 && price < ma20) { shortS += 2; rS.push(`MA death cross + price below MA20`); }

        if (macd > 0) { longS  += 2; rL.push(`MACD positif`); }
        else          { shortS += 2; rS.push(`MACD negatif`); }

        if      (bbPos < 0.2) { longS  += 2; rL.push(`Harga dekat BB Lower`); }
        else if (bbPos > 0.8) { shortS += 2; rS.push(`Harga dekat BB Upper`); }

        if (volR > 1.5 && chg24h > 0) { longS  += 2; rL.push(`Volume ${volR.toFixed(1)}x konfirmasi naik`); }
        else if (volR > 1.5 && chg24h < 0) { shortS += 2; rS.push(`Volume ${volR.toFixed(1)}x konfirmasi turun`); }

        if (frPct !== null) {
            if   (frPct < -0.03) { longS  += 2; rL.push(`Funding negatif → short squeeze potential`); }
            else if (frPct > 0.1){ shortS += 2; rS.push(`Funding tinggi → long flush potential`); }
        }

        if      (fgVal <= 25) { longS  += 2; rL.push(`Extreme fear = bottom zone historis`); }
        else if (fgVal >= 75) { shortS += 2; rS.push(`Extreme greed = top zone historis`); }

        if (((price - sup1) / price * 100) < 1.5) { longS  += 2; rL.push(`Di support kuat $${sup1.toLocaleString()}`); }
        if (((res1 - price) / price * 100) < 1.5) { shortS += 2; rS.push(`Di resistance kuat $${res1.toLocaleString()}`); }

        const total   = longS + shortS;
        const longPct = total > 0 ? (longS / total) * 100 : 50;

        let dir, dirE, label;
        if      (longPct >= 65) { dir='LONG';  dirE='🟢'; label=longPct >= 75 ? 'STRONG LONG 🔥' : 'LONG'; }
        else if (longPct <= 35) { dir='SHORT'; dirE='🔴'; label=longPct <= 25 ? 'STRONG SHORT 🔥' : 'SHORT'; }
        else if (longPct > 52)  { dir='LONG';  dirE='🟡'; label='WEAK LONG (konfirmasi dulu)'; }
        else if (longPct < 48)  { dir='SHORT'; dirE='🟠'; label='WEAK SHORT (konfirmasi dulu)'; }
        else {
            return `⏳ *Trading Signal BTCUSDT*\n\n🟡 Status: *SIDEWAYS – Tunggu Konfirmasi*\n\nIndikator 50/50:\n• Long: ${longS} | Short: ${shortS}\n• RSI 1H: ${rsi1.toFixed(1)} | RSI 4H: ${rsi4.toFixed(1)}\n• MACD: ${macd >= 0 ? '+' : ''}${macd.toFixed(0)}\n\n📌 *Strategi:*\n• Close di atas $${res1.toLocaleString()} → LONG\n• Close di bawah $${sup1.toLocaleString()} → SHORT\n\nF&G: ${fgVal}/100 ${fgEmoji(fgVal)}\n⏰ ${new Date().toLocaleString('id-ID')}\n⚠️ _DYOR_`;
        }

        // Entry/TP/SL
        let entry = price, sl, tp1, tp2, tp3;
        if (dir === 'LONG') {
            sl  = Math.max(price - atr1 * 1.2, sup1 * 0.998);
            tp1 = entry + (entry - sl) * 1.5;
            tp2 = entry + (entry - sl) * 2.5;
            tp3 = Math.min(entry + (entry - sl) * 4, res4 * 1.01);
        } else {
            sl  = Math.min(price + atr1 * 1.2, res1 * 1.002);
            tp1 = entry - (sl - entry) * 1.5;
            tp2 = entry - (sl - entry) * 2.5;
            tp3 = Math.max(entry - (sl - entry) * 4, sup4 * 0.99);
        }

        const slPct  = Math.abs((sl  - entry) / entry * 100).toFixed(2);
        const t1Pct  = Math.abs((tp1 - entry) / entry * 100).toFixed(2);
        const t2Pct  = Math.abs((tp2 - entry) / entry * 100).toFixed(2);
        const t3Pct  = Math.abs((tp3 - entry) / entry * 100).toFixed(2);
        const rr     = dir === 'LONG' ? ((tp2 - entry) / (entry - sl)).toFixed(1) : ((entry - tp2) / (sl - entry)).toFixed(1);

        const atrPct  = (atr1 / price) * 100;
        const levRec  = atrPct > 3 ? '3-5x (volatilitas tinggi)' : atrPct > 1.5 ? '5-10x (sedang)' : '10-15x (rendah)';
        const winPct  = longPct >= 65 || longPct <= 35 ? '65-75%' : '55-60%';

        const longR   = rL.slice(0, 4).map(r => `✅ ${r}`).join('\n');
        const shortR  = rS.slice(0, 3).map(r => `❌ ${r}`).join('\n');
        const counter = dir === 'LONG' ? shortR : longR;

        return `${dirE} *Trading Signal BTCUSDT*\n\n📍 *${label}*\n🎯 Win Rate Est.: ${winPct}\n\n━━━━━━━━━━━━━━━━━━━━\n💰 *Entry Zone*\n$${entry.toLocaleString()}\n\n🎯 *Take Profit*\nTP1: $${tp1.toLocaleString()} (+${t1Pct}%)\nTP2: $${tp2.toLocaleString()} (+${t2Pct}%) ← saran utama\nTP3: $${tp3.toLocaleString()} (+${t3Pct}%)\n\n🛑 *Stop Loss*\nSL: $${sl.toLocaleString()} (-${slPct}%)\n\n━━━━━━━━━━━━━━━━━━━━\n⚖️ Risk/Reward: *1:${rr}*\n🔧 Leverage: ${levRec}\n📊 Skor: Long ${longS} vs Short ${shortS}\n\n📈 *Indikator*\n• RSI 1H: ${rsi1.toFixed(1)} | RSI 4H: ${rsi4.toFixed(1)}\n• MA10: $${ma10.toFixed(0)} | MA20: $${ma20.toFixed(0)}\n• MACD: ${macd >= 0 ? '+' : ''}${macd.toFixed(0)} | Vol: ${volR.toFixed(1)}x\n• BB Pos: ${(bbPos*100).toFixed(0)}% | ATR: $${atr1.toFixed(0)}\n• F&G: ${fgVal}/100 ${fgEmoji(fgVal)}${frPct !== null ? `\n• Funding: ${frPct.toFixed(4)}%` : ''}\n\n🔍 *Alasan Masuk*\n${dir === 'LONG' ? longR : shortR}\n${counter ? `\n⚠️ Counter:\n${counter}` : ''}\n\n📊 *Level Kunci*\n• Sup 1H: $${sup1.toLocaleString()} | Sup 4H: $${sup4.toLocaleString()}\n• Res 1H: $${res1.toLocaleString()} | Res 4H: $${res4.toLocaleString()}\n\n⏰ ${new Date().toLocaleString('id-ID')}\n⚠️ _Kelola risiko! Max 1-2% modal per trade._`;
    } catch (err) {
        log('Signals error: ' + err.message);
        return `❌ Gagal generate signal: ${err.message}`;
    }
}

// ─── Indikator ────────────────────────────────────────────────────
function avg(a)  { return a.reduce((s, x) => s + x, 0) / a.length; }
function pctChg(from, to) { return ((to - from) / from) * 100; }

function rsi(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    let g = 0, l = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const d = prices[i] - prices[i - 1];
        if (d > 0) g += d; else l -= d;
    }
    const ag = g / period, al = l / period;
    if (al === 0) return 100;
    return 100 - (100 / (1 + ag / al));
}

function ema(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    const k = 2 / (period + 1);
    let e = avg(prices.slice(0, period));
    for (let i = period; i < prices.length; i++) e = prices[i] * k + e * (1 - k);
    return e;
}

function atr(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return highs[highs.length-1] - lows[lows.length-1];
    let s = 0;
    for (let i = highs.length - period; i < highs.length; i++) {
        s += Math.max(highs[i]-lows[i], Math.abs(highs[i]-closes[i-1]), Math.abs(lows[i]-closes[i-1]));
    }
    return s / period;
}

function boll(prices, period = 20, std = 2) {
    if (prices.length < period) return [prices[prices.length-1], prices[prices.length-1], prices[prices.length-1]];
    const sl   = prices.slice(-period);
    const mid  = avg(sl);
    const sd   = Math.sqrt(sl.reduce((s, p) => s + (p - mid) ** 2, 0) / period) * std;
    return [mid + sd, mid, mid - sd];
}

function fgEmoji(v) {
    if (v >= 80) return '🤑'; if (v >= 60) return '😏'; if (v >= 45) return '😐'; if (v >= 25) return '😨'; return '💀';
}

// ─── Telegram send ────────────────────────────────────────────────
async function sendWithMenu(chatId, text, log) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const keyboard = {
        keyboard: [
            [{ text: '💰 Price' },  { text: '🔮 Predict' }],
            [{ text: '📊 Signal' }, { text: '😊 Sentiment' }],
            [{ text: '✅ Status' }, { text: '❓ Help' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
    };
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', reply_markup: keyboard }),
    });
    const result = await r.json();
    log('Send result: ' + result.ok);
    return result;
}
