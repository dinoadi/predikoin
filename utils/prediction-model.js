const TechnicalIndicators = require('./technical-indicators');

class PredictionModel {
  constructor(threshold = 0.65) {
    this.threshold = threshold;
  }

  /**
   * Simple ML-like prediction combining multiple signals
   */
  predictBitcoinPrice(data) {
    if (!data || data.length < 26) {
      throw new Error('Insufficient data for prediction');
    }

    const {
      ohlcv,
      openInterest,
      fundingRate,
      sentimentScore,
      taAlert
    } = data;

    // Calculate technical indicators
    const tech = TechnicalIndicators.analyzeIndicators(ohlcv);
    if (!tech) throw new Error('Cannot analyze indicators');

    let signals = [];
    let confidence = 0;

    // Signal 1: RSI
    if (tech.rsi < 30) {
      signals.push({ type: 'RSI_OVERSOLD', weight: 0.15, direction: 'UP' });
      confidence += 0.15;
    } else if (tech.rsi > 70) {
      signals.push({ type: 'RSI_OVERBOUGHT', weight: 0.15, direction: 'DOWN' });
      confidence += 0.15;
    }

    // Signal 2: MA Cross
    if (tech.maCross === 'bull' && tech.ma10 > tech.ma30) {
      signals.push({ type: 'MA_BULLISH', weight: 0.20, direction: 'UP' });
      confidence += 0.20;
    } else if (tech.maCross === 'bear') {
      signals.push({ type: 'MA_BEARISH', weight: 0.15, direction: 'DOWN' });
      confidence += 0.15;
    }

    // Signal 3: Bollinger Bands
    if (tech.signals.bbLowerBreak && tech.rsi < 40) {
      signals.push({ type: 'BB_LOWER_BREAK', weight: 0.10, direction: 'UP' });
      confidence += 0.10;
    } else if (tech.signals.bbUpperBreak && tech.rsi > 60) {
      signals.push({ type: 'BB_UPPER_BREAK', weight: 0.10, direction: 'DOWN' });
      confidence += 0.10;
    }

    // Signal 4: Open Interest (Institutional pressure)
    if (data.previousOI && openInterest) {
      const oiChange = (openInterest - data.previousOI) / data.previousOI;
      if (oiChange > 0.05) {
        signals.push({ type: 'OI_INCREASE', weight: 0.15, direction: 'UP' });
        confidence += 0.15;
      } else if (oiChange < -0.05) {
        signals.push({ type: 'OI_DECREASE', weight: 0.15, direction: 'DOWN' });
        confidence += 0.15;
      }
    }

    // Signal 5: Funding Rate
    const fundingRateValue = parseFloat(fundingRate?.currentRate || 0);
    if (fundingRateValue > 0.0001) {
      signals.push({ type: 'FR_POSITIVE', weight: 0.10, direction: 'UP' });
      confidence += 0.10;
    } else if (fundingRateValue < -0.0001) {
      signals.push({ type: 'FR_NEGATIVE', weight: 0.10, direction: 'DOWN' });
      confidence += 0.10;
    }

    // Signal 6: Sentiment
    if (sentimentScore > 0.3) {
      signals.push({ type: 'SENTIMENT_POSITIVE', weight: 0.15, direction: 'UP' });
      confidence += 0.15;
    } else if (sentimentScore < -0.3) {
      signals.push({ type: 'SENTIMENT_NEGATIVE', weight: 0.15, direction: 'DOWN' });
      confidence += 0.15;
    }

    // Signal 7: TradingView Alert
    if (taAlert) {
      signals.push({ type: 'TA_ALERT', weight: taAlert.weight || 0.20, direction: taAlert.direction });
      confidence += taAlert.weight || 0.20;
    }

    // Calculate direction consensus
    const upSignals = signals.filter(s => s.direction === 'UP').reduce((s, a) => s + a.weight, 0);
    const downSignals = signals.filter(s => s.direction === 'DOWN').reduce((s, a) => s + a.weight, 0);

    const direction = upSignals > downSignals ? 'UP' : downSignals > upSignals ? 'DOWN' : 'NEUTRAL';
    const directionalConfidence = Math.abs(upSignals - downSignals);

    return {
      prediction: direction,
      confidence: Math.min(confidence, 1.0),
      directionalConfidence,
      shouldTrade: directionalConfidence > this.threshold,
      signals,
      upSignals,
      downSignals,
      technicals: tech,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate trading signal
   */
  generateTradeSignal(prediction) {
    if (!prediction.shouldTrade) {
      return {
        action: 'HOLD',
        reasoning: 'Confidence below threshold',
        confidence: prediction.confidence
      };
    }

    return {
      action: prediction.prediction === 'UP' ? 'BUY' : 'SELL',
      confidence: prediction.directionalConfidence,
      reasoning: `${prediction.signals.length} signals confirmed`,
      signals: prediction.signals.map(s => s.type),
      riskLevel: prediction.directionalConfidence > 0.7 ? 'LOW' : 'MEDIUM'
    };
  }
}

module.exports = PredictionModel;
