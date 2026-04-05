const axios = require('axios');

class TelegramClient {
  constructor(botToken, chatId) {
    this.botToken = botToken;
    this.chatId = chatId;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  /**
   * Send a trading signal message
   */
  async sendTradeSignal(tradeSignal, prediction, currentPrice) {
    const emoji = tradeSignal.action === 'BUY' ? '🟢' : tradeSignal.action === 'SELL' ? '🔴' : '🟡';
    const timestamp = new Date().toLocaleString('id-ID');

    const message = `
${emoji} <b>TRADING SIGNAL</b>

<b>Action:</b> ${tradeSignal.action}
<b>Confidence:</b> ${(tradeSignal.confidence * 100).toFixed(1)}%
<b>Risk Level:</b> ${tradeSignal.riskLevel}

<b>Current Price:</b> $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}

<b>Signals:</b>
${tradeSignal.signals.map(s => `• ${s}`).join('\n')}

<b>Reasoning:</b> ${tradeSignal.reasoning}

<i>${timestamp}</i>
    `.trim();

    return this.sendMessage(message);
  }

  /**
   * Send price analysis
   */
  async sendPriceAnalysis(tech, currentPrice) {
    const rsiColor = tech.rsi > 70 ? '🔴' : tech.rsi < 30 ? '🟢' : '🟡';
    const maColor = tech.maCross === 'bull' ? '🟢' : '🔴';

    const message = `
📊 <b>PRICE ANALYSIS</b>

<b>Current Price:</b> $${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}

${rsiColor} <b>RSI (14):</b> ${tech.rsi.toFixed(2)}
${maColor} <b>MA Cross:</b> ${tech.maCross.toUpperCase()}
  • MA10: $${tech.ma10.toFixed(2)}
  • MA30: $${tech.ma30.toFixed(2)}

<b>Bollinger Bands:</b>
  • Upper: $${tech.bollingerBands.upper.toFixed(2)}
  • Middle: $${tech.bollingerBands.middle.toFixed(2)}
  • Lower: $${tech.bollingerBands.lower.toFixed(2)}

<i>${new Date().toLocaleString('id-ID')}</i>
    `.trim();

    return this.sendMessage(message);
  }

  /**
   * Send sentiment analysis update
   */
  async sendSentimentUpdate(sentiment) {
    const sentimentEmoji = sentiment.label === 'positive' ? '🟢' : sentiment.label === 'negative' ? '🔴' : '🟡';

    const message = `
💭 <b>SENTIMENT ANALYSIS</b>

${sentimentEmoji} <b>Overall:</b> ${sentiment.label.toUpperCase()}
<b>Score:</b> ${(sentiment.averageSentiment * 100).toFixed(1)}%
<b>Articles:</b> ${sentiment.articlesCount}

<b>Top Sources:</b>
${sentiment.details.slice(0, 5).map(d =>
  `• ${d.source}: ${(d.combinedScore * 100).toFixed(0)}%`
).join('\n')}

<i>${new Date().toLocaleString('id-ID')}</i>
    `.trim();

    return this.sendMessage(message);
  }

  /**
   * Send error/alert message
   */
  async sendAlert(title, message, type = 'INFO') {
    const emoji = type === 'ERROR' ? '⚠️' : type === 'SUCCESS' ? '✅' : 'ℹ️';

    const fullMessage = `
${emoji} <b>${title}</b>

${message}

<i>${new Date().toLocaleString('id-ID')}</i>
    `.trim();

    return this.sendMessage(fullMessage);
  }

  /**
   * Send raw message
   */
  async sendMessage(text) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sendMessage`,
        {
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML'
        },
        { timeout: 5000 }
      );

      return {
        success: true,
        messageId: response.data.result.message_id,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Telegram send error:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Send document/file
   */
  async sendDocument(fileBuffer, filename, caption = '') {
    try {
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('document', new Blob([fileBuffer]), filename);
      if (caption) formData.append('caption', caption);

      const response = await axios.post(
        `${this.apiUrl}/sendDocument`,
        formData,
        { timeout: 10000 }
      );

      return { success: true, messageId: response.data.result.message_id };
    } catch (error) {
      console.error('Telegram document send error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TelegramClient;
