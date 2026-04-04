/**
 * Appwrite Function: predict_bitcoin
 * Trigger: Cron tiap 1 jam
 * Purpose: Generate price predictions using ML model
 */

const DataFetcher = require('../utils/data-fetcher');
const SentimentAnalyzer = require('../utils/sentiment-analyzer');
const PredictionModel = require('../utils/prediction-model');
const { Client, Databases } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);

  try {
    const predictionModel = new PredictionModel(
      parseFloat(process.env.MODEL_THRESHOLD || 0.65)
    );

    // 1. Fetch price data
    const fetcher = new DataFetcher(
      process.env.BINANCE_API_KEY,
      process.env.BINANCE_API_SECRET,
      process.env.BYBIT_API_KEY,
      process.env.BYBIT_API_SECRET
    );

    const ohlcv = await fetcher.fetchBinanceOHLCV('BTCUSDT', '1h', 50);
    const currentPrice = await fetcher.fetchSpotPrice('BTCUSDT');
    const openInterest = await fetcher.fetchBybitOpenInterest('BTCUSDT');
    const fundingRate = await fetcher.fetchBybitFundingRate('BTCUSDT');

    console.log('Fetched price data');

    // 2. Fetch sentiment
    const analyzer = new SentimentAnalyzer(
      process.env.CRYPTOPANIC_API_KEY,
      process.env.NEWSAPI_KEY
    );

    const cryptoPanicNews = await analyzer.fetchCryptoPanicNews();
    const financeNews = await analyzer.fetchFinanceNews();
    const allNews = [...cryptoPanicNews, ...financeNews];
    const sentimentAnalysis = await analyzer.analyzeNewsSentiment(allNews);

    console.log('Analyzed sentiment');

    // 3. Prepare prediction data
    const predictionData = {
      ohlcv,
      openInterest: openInterest?.openInterest,
      fundingRate,
      sentimentScore: sentimentAnalysis.averageSentiment,
      previousOI: openInterest?.openInterest * 0.98, // Simulated previous OI
      taAlert: null // Would be populated from TradingView webhook
    };

    // 4. Make prediction
    const prediction = predictionModel.predictBitcoinPrice(predictionData);
    const tradeSignal = predictionModel.generateTradeSignal(prediction);

    console.log('Prediction:', prediction);
    console.log('Trade Signal:', tradeSignal);

    // 5. Store prediction
    const predictionRecord = {
      symbol: 'BTCUSDT',
      currentPrice: currentPrice.price,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      directionalConfidence: prediction.directionalConfidence,
      shouldTrade: prediction.shouldTrade,
      action: tradeSignal.action,
      riskLevel: tradeSignal.riskLevel,
      signals: prediction.signals.map(s => s.type),
      sentiment: sentimentAnalysis.label,
      sentimentScore: sentimentAnalysis.averageSentiment,
      technicalData: {
        rsi: prediction.technicals.rsi,
        ma10: prediction.technicals.ma10,
        ma30: prediction.technicals.ma30,
        maCross: prediction.technicals.maCross
      },
      timestamp: new Date().toISOString(),
      createdAt: new Date().getTime()
    };

    // TODO: Save to database
    // await databases.createDocument(
    //   process.env.APPWRITE_DATABASE_ID,
    //   'predictions',
    //   ID.unique(),
    //   predictionRecord
    // );

    return res.json({
      success: true,
      message: 'Prediction generated',
      prediction: predictionRecord,
      tradeSignal,
      sentiment: {
        label: sentimentAnalysis.label,
        score: sentimentAnalysis.averageSentiment,
        articlesCount: sentimentAnalysis.articlesCount
      }
    });
  } catch (error) {
    console.error('Prediction Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
