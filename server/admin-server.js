/**
 * Web Server for Admin Dashboard & APIs
 * Express server with authentication
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

class AdminServer {
  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Login endpoint
    this.app.post('/api/login', (req, res) => {
      const { username, password } = req.body;

      if (username !== 'admin' || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate simple token (in production use JWT)
      const token = Buffer.from(
        JSON.stringify({ user: 'admin', timestamp: Date.now() })
      ).toString('base64');

      res.json({ token, user: 'admin' });
    });

    // Dashboard data endpoint
    this.app.get('/api/dashboard', this.authMiddleware, (req, res) => {
      // In production, fetch from Appwrite database
      const mockData = {
        currentPrice: 42000.50,
        priceChange: 2.5,
        prediction: {
          action: 'BUY',
          confidence: 0.78,
          riskLevel: 'LOW',
          timestamp: new Date().toISOString()
        },
        sentiment: {
          label: 'positive',
          score: 0.35
        },
        technicals: {
          rsi: 28,
          ma10: 41800,
          ma30: 42000
        },
        signals: [
          {
            type: 'RSI_OVERSOLD',
            direction: 'UP',
            timestamp: new Date().toISOString()
          },
          {
            type: 'MA_BULLISH',
            direction: 'UP',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        priceHistory: this.generateMockPriceHistory(),
        lastUpdate: new Date().toISOString()
      };

      res.json(mockData);
    });

    // Predictions endpoint
    this.app.get('/api/predictions', this.authMiddleware, (req, res) => {
      const predictions = [
        {
          timestamp: new Date().toISOString(),
          prediction: 'UP',
          confidence: 0.78,
          action: 'BUY'
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          prediction: 'UP',
          confidence: 0.65,
          action: 'BUY'
        }
      ];

      res.json(predictions);
    });

    // Signals endpoint
    this.app.get('/api/signals', this.authMiddleware, (req, res) => {
      const signals = [
        {
          type: 'RSI_OVERSOLD',
          timestamp: new Date().toISOString(),
          price: 41500,
          action: 'BUY'
        }
      ];

      res.json(signals);
    });

    // System status endpoint
    this.app.get('/api/status', this.authMiddleware, (req, res) => {
      res.json({
        status: 'healthy',
        functions: {
          fetch_price: 'running',
          news_sentiment: 'running',
          predict_bitcoin: 'running',
          telegram_notif: 'running',
          data_cleanup: 'running'
        },
        database: 'connected',
        lastSync: new Date().toISOString()
      });
    });

    // Serve static files
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    this.app.get('/dashboard.html', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/dashboard.html'));
    });
  }

  /**
   * Authentication middleware
   */
  authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  /**
   * Generate mock price history
   */
  generateMockPriceHistory() {
    const history = [];
    let price = 40000;

    for (let i = 0; i < 24; i++) {
      price += (Math.random() - 0.4) * 200;
      history.push({
        timestamp: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
        price: Math.round(price * 100) / 100
      });
    }

    return history;
  }

  /**
   * Start server
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`\n✅ Admin Dashboard running at http://localhost:${this.port}`);
      console.log(`📊 Go to: http://localhost:${this.port}/`);
      console.log(`   Username: admin`);
      console.log(`   Password: (from .env ADMIN_PASSWORD)\n`);
    });
  }
}

module.exports = AdminServer;
