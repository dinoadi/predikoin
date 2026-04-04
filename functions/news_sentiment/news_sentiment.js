/**
 * Appwrite Function: news_sentiment
 * Trigger: Cron tiap 2 jam
 * Purpose: Analyze sentiment dari crypto & finance news
 */

const SentimentAnalyzer = require('../utils/sentiment-analyzer');
const { Client, Databases } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);

  try {
    const analyzer = new SentimentAnalyzer(
      process.env.CRYPTOPANIC_API_KEY,
      process.env.NEWSAPI_KEY
    );

    // Fetch news
    const cryptoPanicNews = await analyzer.fetchCryptoPanicNews();
    const financeNews = await analyzer.fetchFinanceNews();

    console.log('CryptoPanic articles:', cryptoPanicNews.length);
    console.log('Finance news:', financeNews.length);

    // Combine news
    const allNews = [
      ...cryptoPanicNews.map(n => ({ ...n, source: n.source || 'CryptoPanic' })),
      ...financeNews.map(n => ({ ...n, source: n.source || 'NewsAPI' }))
    ];

    // Analyze sentiment
    const sentimentAnalysis = await analyzer.analyzeNewsSentiment(allNews);

    console.log('Sentiment analysis:', sentimentAnalysis);

    // Store results
    const sentimentData = {
      articlesCount: sentimentAnalysis.articlesCount,
      averageSentiment: sentimentAnalysis.averageSentiment,
      label: sentimentAnalysis.label,
      timestamp: new Date().toISOString(),
      sources: {
        cryptopanic: cryptoPanicNews.length,
        newsapi: financeNews.length
      },
      topArticles: sentimentAnalysis.details.slice(0, 5).map(d => ({
        source: d.source,
        score: d.combinedScore,
        title: d.title.substring(0, 80)
      }))
    };

    // TODO: Save to database
    // await databases.createDocument(
    //   process.env.APPWRITE_DATABASE_ID,
    //   'sentiment_data',
    //   ID.unique(),
    //   sentimentData
    // );

    return res.json({
      success: true,
      message: 'Sentiment analysis completed',
      data: sentimentData,
      details: sentimentAnalysis
    });
  } catch (error) {
    console.error('News Sentiment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
