/**
 * Appwrite Function: fetch_price
 * Trigger: Cron tiap 1 jam
 * Purpose: Fetch OHLCV data dari Binance & Bybit
 */

const DataFetcher = require('../utils/data-fetcher');
const { Client, Databases } = require('appwrite');

module.exports = async function (req, res) {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_API_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

  const databases = new Databases(client);

  try {
    const fetcher = new DataFetcher(
      process.env.BINANCE_API_KEY,
      process.env.BINANCE_API_SECRET,
      process.env.BYBIT_API_KEY,
      process.env.BYBIT_API_SECRET
    );

    // Fetch spot price
    const spotPrice = await fetcher.fetchSpotPrice('BTCUSDT');
    console.log('Spot Price:', spotPrice);

    // Fetch OHLCV data - 1 hour candles
    const binanceOHLCV = await fetcher.fetchBinanceOHLCV('BTCUSDT', '1h', 100);
    const bybitOHLCV = await fetcher.fetchBybitOHLCV('BTCUSDT', '60', 100);

    console.log('Binance candles:', binanceOHLCV.length);
    console.log('Bybit candles:', bybitOHLCV.length);

    // Fetch Bybit Open Interest
    const openInterest = await fetcher.fetchBybitOpenInterest('BTCUSDT');
    console.log('Open Interest:', openInterest);

    // Fetch Bybit Funding Rate
    const fundingRate = await fetcher.fetchBybitFundingRate('BTCUSDT');
    console.log('Funding Rate:', fundingRate);

    // Store data
    const priceData = {
      symbol: 'BTCUSDT',
      spotPrice: spotPrice.price,
      binanceCandles: binanceOHLCV.length,
      bybitCandles: bybitOHLCV.length,
      openInterest: openInterest?.openInterest,
      fundingRate: fundingRate?.currentRate,
      timestamp: new Date().toISOString(),
      fetchedAt: new Date().getTime()
    };

    // TODO: Save to Appwrite database
    // await databases.createDocument(
    //   process.env.APPWRITE_DATABASE_ID,
    //   'price_data',
    //   ID.unique(),
    //   priceData
    // );

    return res.json({
      success: true,
      message: 'Price fetch completed',
      data: priceData,
      candles: {
        binance: binanceOHLCV,
        bybit: bybitOHLCV
      }
    });
  } catch (error) {
    console.error('Fetch Price Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
