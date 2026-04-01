/**
 * Data Fetcher - Versi Public APIs (Gratis)
 * Tidak perlu API Key untuk Binance, Bybit, CoinGecko
 */

const axios = require('axios');

class DataFetcher {
  constructor() {
    this.binanceAPI = 'https://api.binance.com/api/v3';
    this.bybitAPI = 'https://api.bybit.com/v5';
    this.coingeckoAPI = 'https://api.coingecko.com/api/v3';

    this.axiosInstance = axios.create({
      timeout: 5000
    });
  }

  /**
   * Fetch OHLCV dari Binance (PUBLIC - no auth needed)
   * @param {string} symbol - e.g., 'BTCUSDT'
   * @param {string} interval - e.g., '1h', '4h', '1d'
   * @param {number} limit - max 1000
   */
  async fetchBinanceOHLCV(symbol, interval, limit = 100) {
    try {
      const response = await this.axiosInstance.get(
        `${this.binanceAPI}/klines`,
        {
          params: {
            symbol,
            interval,
            limit: Math.min(limit, 1000)
          }
        }
      );

      return response.data.map(candle => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[7]),
        source: 'binance'
      }));
    } catch (error) {
      console.error('Binance fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch OHLCV dari Bybit (PUBLIC - no auth needed)
   * @param {string} symbol - e.g., 'BTCUSDT'
   * @param {string} interval - e.g., '60', '240', '1440' (minutes)
   * @param {number} limit
   */
  async fetchBybitOHLCV(symbol, interval, limit = 100) {
    try {
      const response = await this.axiosInstance.get(
        `${this.bybitAPI}/market/kline`,
        {
          params: {
            category: 'linear',
            symbol,
            interval,
            limit: Math.min(limit, 200)
          }
        }
      );

      const candles = response.data.result.list || [];
      return candles.reverse().map(candle => ({
        timestamp: parseInt(candle[0]),
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        source: 'bybit'
      }));
    } catch (error) {
      console.error('Bybit OHLCV fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch open interest dari Bybit (PUBLIC)
   * @param {string} symbol
   */
  async fetchBybitOpenInterest(symbol) {
    try {
      const response = await this.axiosInstance.get(
        `${this.bybitAPI}/market/open-interest`,
        {
          params: {
            category: 'linear',
            symbol,
            intervalTime: '5min',
            limit: 1
          }
        }
      );

      const data = response.data.result.list?.[0];
      if (!data) return null;

      return {
        symbol,
        openInterest: parseFloat(data.openInterest),
        timestamp: parseInt(data.timestamp)
      };
    } catch (error) {
      console.error('Bybit Open Interest error:', error.message);
      return null;
    }
  }

  /**
   * Fetch funding rate dari Bybit (PUBLIC)
   * @param {string} symbol
   */
  async fetchBybitFundingRate(symbol) {
    try {
      const response = await this.axiosInstance.get(
        `${this.bybitAPI}/market/funding/history`,
        {
          params: {
            category: 'linear',
            symbol,
            limit: 20
          }
        }
      );

      const rates = response.data.result?.list || [];
      if (rates.length === 0) return null;

      const avgRate = rates.reduce((sum, r) => sum + parseFloat(r.fundingRate), 0) / rates.length;

      return {
        symbol,
        currentRate: rates[0]?.fundingRate || '0',
        avgRate,
        count: rates.length
      };
    } catch (error) {
      console.error('Bybit Funding Rate error:', error.message);
      return null;
    }
  }

  /**
   * Fetch spot price via CoinGecko (GRATIS, NO KEY)
   * Lebih reliable daripada Binance ticker
   */
  async fetchSpotPrice(coinId = 'bitcoin') {
    try {
      const response = await this.axiosInstance.get(
        `${this.coingeckoAPI}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
            include_market_cap: 'true',
            include_24hr_vol: 'true',
            include_24hr_change: 'true'
          }
        }
      );

      const data = response.data[coinId];
      return {
        symbol: 'BTC/USD',
        price: data.usd,
        marketCap: data.usd_market_cap,
        volume24h: data.usd_24h_vol,
        change24h: data.usd_24h_change,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('CoinGecko price fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch market data (dominance, fear index, dll)
   * CoinGecko - FREE API
   */
  async fetchMarketData() {
    try {
      const response = await this.axiosInstance.get(
        `${this.coingeckoAPI}/global`
      );

      const data = response.data.data;
      return {
        btcDominance: data.btc_market_cap_percentage?.btc,
        totalVolume24h: data.total_volume?.usd,
        totalMarketCap: data.total_market_cap?.usd,
        ethDominance: data.btc_market_cap_percentage?.eth,
        btcFear: data.market_cap_change_percentage_24h_usd,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market data fetch error:', error.message);
      return null;
    }
  }

  /**
   * Fetch trending coins (CoinGecko trending)
   * Bisa jadi sentiment indicator
   */
  async fetchTrendingCoins() {
    try {
      const response = await this.axiosInstance.get(
        `${this.coingeckoAPI}/search/trending`
      );

      return response.data.coins.slice(0, 10).map(item => ({
        name: item.item.name,
        symbol: item.item.symbol.toUpperCase(),
        marketCapRank: item.item.market_cap_rank
      }));
    } catch (error) {
      console.error('Trending coins fetch error:', error.message);
      return [];
    }
  }

  /**
   * Fetch OHLCV dari Yahoo Finance (Alternative)
   * Terakhir gunakan jika Binance/Bybit down
   */
  async fetchYahooOHLCV(symbol = 'BTC-USD', period = '1d') {
    try {
      // Yahoo Finance memerlukan lebih kompleks, bisa diganti CPython atau API lain
      console.warn('Yahoo Finance fetch not implemented, use Binance/Bybit');
      return [];
    } catch (error) {
      return [];
    }
  }
}

module.exports = DataFetcher;
