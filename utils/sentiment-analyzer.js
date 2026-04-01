/**
 * News Sentiment Analyzer - Versi Public APIs
 * Menggunakan NewsAPI (free tier) + sentiment keywords
 */

const axios = require('axios');

class SentimentAnalyzer {
  constructor(newsApiKey) {
    this.newsApiKey = newsApiKey;
    this.axiosInstance = axios.create({
      timeout: 5000
    });
  }

  /**
   * Fetch Bitcoin news dari NewsAPI
   * Free tier: 250 requests/day
   */
  async fetchBitcoinNews() {
    try {
      if (!this.newsApiKey) {
        console.warn('NewsAPI key not configured, using cached data');
        return this.getCachedNews();
      }

      const response = await this.axiosInstance.get(
        'https://newsapi.org/v2/everything',
        {
          params: {
            q: 'bitcoin OR BTC',
            sortBy: 'publishedAt',
            language: 'en',
            pageSize: 50,
            apiKey: this.newsApiKey
          }
        }
      );

      return response.data.articles?.map(article => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
        url: article.url,
        timestamp: article.publishedAt,
        image: article.urlToImage
      })) || [];
    } catch (error) {
      console.error('NewsAPI fetch error:', error.message);
      return this.getCachedNews(); // Fallback ke cached
    }
  }

  /**
   * Fetch dari CryptoPanic (PUBLIC API - no key needed)
   * Lebih cocok untuk crypto news
   */
  async fetchCryptoPanicNews() {
    try {
      const response = await this.axiosInstance.get(
        'https://cryptopanic.com/api/v1/posts/',
        {
          params: {
            auth_token: 'free', // Public access
            filter: 'trending',
            currencies: 'BTC',
            limit: 50
          }
        }
      );

      return response.data.results?.map(article => ({
        title: article.title,
        description: article.body || '',
        source: article.source?.title || 'CryptoPanic',
        url: article.url,
        timestamp: article.published_at,
        votes: {
          negative: article.votes?.negative || 0,
          positive: article.votes?.positive || 0
        }
      })) || [];
    } catch (error) {
      console.error('CryptoPanic fetch error:', error.message);
      return [];
    }
  }

  /**
   * Simple sentiment analysis based on keywords
   */
  analyzeSentiment(text) {
    if (!text) return { score: 0, label: 'neutral' };

    const positiveKeywords = [
      'gain', 'surge', 'rally', 'bull', 'high', 'pump', 'jump',
      'up', 'break', 'record', 'bullish', 'positive', 'approval',
      'adoption', 'boom', 'soar', 'spike', 'skyrocket', 'moon'
    ];

    const negativeKeywords = [
      'drop', 'crash', 'fall', 'bear', 'low', 'dump', 'plunge',
      'down', 'loss', 'decline', 'bearish', 'negative', 'reject',
      'ban', 'risk', 'concern', 'slump', 'collapse', 'crash'
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveKeywords.forEach(keyword => {
      const matches = lowerText.match(new RegExp(keyword, 'g'));
      score += matches ? matches.length : 0;
    });

    negativeKeywords.forEach(keyword => {
      const matches = lowerText.match(new RegExp(keyword, 'g'));
      score -= matches ? matches.length : 0;
    });

    const normalizedScore = Math.max(-1, Math.min(1, score / 10));

    return {
      score: normalizedScore,
      label: normalizedScore > 0.2 ? 'positive' : normalizedScore < -0.2 ? 'negative' : 'neutral',
      rawScore: score
    };
  }

  /**
   * Analyze all news sentiment
   */
  async analyzeNewsSentiment() {
    try {
      // Fetch dari multiple sources
      const newsApiNews = await this.fetchBitcoinNews();
      const cryptoPanicNews = await this.fetchCryptoPanicNews();

      const allNews = [
        ...newsApiNews,
        ...cryptoPanicNews
      ];

      if (allNews.length === 0) {
        return {
          articlesCount: 0,
          averageSentiment: 0,
          label: 'neutral',
          details: []
        };
      }

      const sentiments = allNews.map(article => {
        const titleSentiment = this.analyzeSentiment(article.title);
        const descSentiment = this.analyzeSentiment(article.description || '');

        return {
          source: article.source,
          title: article.title,
          titleSentiment: titleSentiment.score,
          descSentiment: descSentiment.score,
          combinedScore: (titleSentiment.score + descSentiment.score) / 2,
          timestamp: article.timestamp
        };
      });

      const avgScore = sentiments.reduce((sum, s) => sum + s.combinedScore, 0) / sentiments.length;

      return {
        articlesCount: allNews.length,
        averageSentiment: avgScore,
        label: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
        details: sentiments,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        articlesCount: 0,
        averageSentiment: 0,
        label: 'neutral',
        details: []
      };
    }
  }

  /**
   * Cached news for fallback
   */
  getCachedNews() {
    return [
      {
        title: 'Bitcoin rallies after positive news',
        description: 'Market sentiment improves',
        source: 'Default Cache',
        timestamp: new Date().toISOString()
      }
    ];
  }
}

module.exports = SentimentAnalyzer;
