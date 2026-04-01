class TechnicalIndicators {
  /**
   * Calculate RSI (Relative Strength Index)
   */
  static RSI(data, period = 14) {
    if (data.length < period + 1) return null;

    const closes = data.map(d => d.close);
    const deltas = [];

    for (let i = 1; i < closes.length; i++) {
      deltas.push(closes[i] - closes[i - 1]);
    }

    let gains = 0;
    let losses = 0;

    for (let i = 0; i < period; i++) {
      if (deltas[i] > 0) gains += deltas[i];
      else losses += Math.abs(deltas[i]);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
  }

  /**
   * Calculate Simple Moving Average
   */
  static SMA(data, period) {
    if (data.length < period) return null;

    const closes = data.map(d => d.close);
    const sum = closes.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  /**
   * Calculate Exponential Moving Average
   */
  static EMA(data, period) {
    if (data.length < period) return null;

    const closes = data.map(d => d.close);
    const k = 2 / (period + 1);
    let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < closes.length; i++) {
      ema = closes[i] * k + ema * (1 - k);
    }

    return ema;
  }

  /**
   * Calculate MACD (12, 26, 9)
   */
  static MACD(data) {
    const ema12 = this.EMA(data, 12);
    const ema26 = this.EMA(data, 26);

    if (!ema12 || !ema26) return null;

    const macdLine = ema12 - ema26;
    return { macdLine };
  }

  /**
   * Calculate Bollinger Bands
   */
  static BollingerBands(data, period = 20, stdDev = 2) {
    if (data.length < period) return null;

    const closes = data.map(d => d.close);
    const last = closes.slice(-period);

    const sma = last.reduce((a, b) => a + b, 0) / period;
    const variance = last.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
    const std = Math.sqrt(variance);

    return {
      middle: sma,
      upper: sma + stdDev * std,
      lower: sma - stdDev * std
    };
  }

  /**
   * Analyze technical indicators
   */
  static analyzeIndicators(ohlcvData) {
    if (ohlcvData.length < 26) return null;

    const rsi = this.RSI(ohlcvData);
    const ma10 = this.SMA(ohlcvData, 10);
    const ma30 = this.SMA(ohlcvData, 30);
    const macd = this.MACD(ohlcvData);
    const bb = this.BollingerBands(ohlcvData);
    const currentPrice = ohlcvData[ohlcvData.length - 1].close;

    return {
      rsi,
      ma10,
      ma30,
      maCross: ma10 > ma30 ? 'bull' : 'bear',
      macd,
      bollingerBands: bb,
      currentPrice,
      signals: {
        rsiOverbought: rsi > 70,
        rsiOversold: rsi < 30,
        bbUpperBreak: currentPrice > bb.upper,
        bbLowerBreak: currentPrice < bb.lower,
        maGoldenCross: ma10 > ma30 && rsi < 50
      }
    };
  }
}

module.exports = TechnicalIndicators;
