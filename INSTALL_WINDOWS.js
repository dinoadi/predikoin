#!/usr/bin/env node

/**
 * Windows Installation Helper
 * Copy-paste friendly commands
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`
${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚀 BITCOIN PREDICTOR - QUICK INSTALLATION                ║
║                                                            ║
║  Public APIs Version (100% FREE)                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}
`);

console.log(`${colors.bright}Step 1: Navigate to project${colors.reset}`);
console.log(`${colors.green}cd d:/Arief/predikoin${colors.reset}\n`);

console.log(`${colors.bright}Step 2: Install dependencies${colors.reset}`);
console.log(`${colors.green}npm install${colors.reset}`);
console.log(`(Takes 1-2 minutes)\n`);

console.log(`${colors.bright}Step 3: Get Telegram Chat ID${colors.reset}`);
console.log(`Windows CMD:
${colors.yellow}curl "https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getUpdates"${colors.reset}

PowerShell:
${colors.yellow}Invoke-WebRequest -Uri "https://api.telegram.org/bot8603957892:AAG4os6JvH6BS1ukcC6C3eifsEkmyNNEaYo/getUpdates" | Select-Object Content${colors.reset}

Look for: ${colors.bright}"chat":{"id":XXXXXXX}${colors.reset}
Copy that XXXXXXX number\n`);

console.log(`${colors.bright}Step 4: Edit .env file${colors.reset}`);
console.log(`${colors.yellow}notepad .env${colors.reset}
or use VSCode/Notepad++ to open .env\n`);

console.log(`${colors.bright}MUST CHANGE IN .env:${colors.reset}
${colors.green}✓ TELEGRAM_CHAT_ID=${colors.yellow}your_number_from_step_3${colors.reset}
${colors.green}✓ ADMIN_PASSWORD=${colors.yellow}your_secure_password${colors.reset}\n`);

console.log(`${colors.bright}OPTIONAL IN .env:${colors.reset}
${colors.yellow}NEWSAPI_KEY${colors.reset} - Free tier from https://newsapi.org/
${colors.yellow}(Leave blank to skip - will use only CryptoPanic)${colors.reset}\n`);

console.log(`${colors.bright}Step 5: Start dashboard${colors.reset}`);
console.log(`${colors.green}npm run dev-admin${colors.reset}\n`);

console.log(`${colors.bright}Step 6: Access system${colors.reset}`);
console.log(`
Web Dashboard:
  URL: ${colors.green}http://localhost:3000${colors.reset}
  Username: ${colors.green}admin${colors.reset}
  Password: ${colors.yellow}(your ADMIN_PASSWORD from .env)${colors.reset}

Telegram Bot:
  Commands: ${colors.green}/price /predict /help${colors.reset}
  Send any command to your bot in Telegram
\n`);

console.log(`${colors.bright}Troubleshooting:${colors.reset}
${colors.yellow}npm install fails?${colors.reset}
  → Try: npm install -g npm@latest
  → Then: npm install (again)

${colors.yellow}Telegram bot not responding?${colors.reset}
  → Check .env TELEGRAM_CHAT_ID is correct
  → Send /help to your bot manually
  → Check Node console for errors

${colors.yellow}Dashboard won't load?${colors.reset}
  → Check http://localhost:3000 works
  → Try different password
  → Clear browser cache\n`);

console.log(`${colors.bright}${colors.green}
✅ Installation Complete!

System includes:
  • Real-time Bitcoin price (Binance, Bybit, CoinGecko)
  • AI predictions with 7 signals
  • News sentiment analysis
  • Trading signals (BUY/SELL/HOLD)
  • Telegram 24/7 access
  • Web admin dashboard
  • Auto data cleanup

Cost: $0 🎉

Ready to trade! 🚀
${colors.reset}
`);
