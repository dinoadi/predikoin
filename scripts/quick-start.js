#!/usr/bin/env node

/**
 * Quick Start Script
 * Setup & start the Bitcoin Predictor system
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  console.log('\n');
  log('='.repeat(60), 'blue');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'blue');
}

async function main() {
  section('🚀 Bitcoin Predictor - Quick Start Setup');

  // Step 1: Check Node.js
  log('\n✓ Checking Node.js version...', 'green');
  const nodeVersion = process.version;
  log(`  Node.js ${nodeVersion}`);

  // Step 2: Check .env
  section('📋 Environment Configuration');

  const envPath = path.join(__dirname, '.env');
  const envExample = path.join(__dirname, '.env.example');

  if (!fs.existsSync(envPath)) {
    log('⚠️  .env file not found', 'yellow');
    log('Creating from template...', 'yellow');

    if (fs.existsSync(envExample)) {
      fs.copyFileSync(envExample, envPath);
      log('✓ .env created from template', 'green');
    }
  } else {
    log('✓ .env file exists', 'green');
  }

  // Step 3: Check dependencies
  section('📦 Dependencies');

  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('✗ package.json not found', 'red');
    process.exit(1);
  }

  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('Installing dependencies...', 'yellow');
    log('(This may take a few minutes)\n', 'yellow');

    const { execSync } = require('child_process');
    try {
      execSync('npm install', { stdio: 'inherit' });
      log('✓ Dependencies installed', 'green');
    } catch (error) {
      log('✗ Failed to install dependencies', 'red');
      log('Run: npm install', 'yellow');
      process.exit(1);
    }
  } else {
    log('✓ Dependencies already installed', 'green');
  }

  // Step 4: Check configuration
  section('🔧 Configuration Check');

  const env = require('dotenv').config({ path: envPath }).parsed || {};

  const requiredVars = [
    'APPWRITE_API_ENDPOINT',
    'APPWRITE_PROJECT_ID',
    'BINANCE_API_KEY',
    'BYBIT_API_KEY',
    'TELEGRAM_BOT_TOKEN'
  ];

  let allConfigured = true;
  requiredVars.forEach(varName => {
    const value = env[varName];
    if (value && value !== 'your_' + varName.toLowerCase() && !value.includes('your_')) {
      log(`✓ ${varName}`, 'green');
    } else {
      log(`⚠️  ${varName} - needs configuration`, 'yellow');
      allConfigured = false;
    }
  });

  if (!allConfigured) {
    section('⚙️  Configuration Required');
    log('Edit .env file with your API keys:', 'yellow');
    log('  nano .env  (or use your favorite editor)\n', 'yellow');

    log('You need:', 'bright');
    log('1. Appwrite endpoint & project ID', 'yellow');
    log('2. Binance & Bybit API keys', 'yellow');
    log('3. Telegram bot token (already configured ✓)', 'green');
    log('4. News API keys', 'yellow');
  }

  // Step 5: Project structure
  section('📁 Project Structure');

  const dirs = [
    'functions',
    'utils',
    'server',
    'public',
    'tests'
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      log(`✓ ${dir}/`, 'green');
    }
  });

  // Step 6: Next steps
  section('📖 Next Steps');

  log('\n1️⃣  Configure .env file:', 'bright');
  log('   Edit .env and add your API keys\n', 'yellow');

  log('2️⃣  Deploy to Appwrite:', 'bright');
  log('   appwrite login', 'yellow');
  log('   appwrite deploy\n', 'yellow');

  log('3️⃣  Start Admin Dashboard:', 'bright');
  log('   npm run dev-admin\n', 'yellow');

  log('4️⃣  Access the system:', 'bright');
  log('   Web: http://localhost:3000', 'blue');
  log('   Telegram: Send /help to your bot\n', 'blue');

  // Step 7: Available commands
  section('🔧 Available Commands');

  const commands = {
    'npm install': 'Install dependencies',
    'npm run dev-admin': 'Start admin dashboard',
    'npm test': 'Run tests',
    'npm run deploy': 'Deploy to Appwrite',
    'npm run logs': 'View function logs',
    'npm run cleanup': 'Manual database cleanup'
  };

  Object.entries(commands).forEach(([cmd, desc]) => {
    log(`${cmd}`, 'bright');
    log(`  └─ ${desc}\n`, 'yellow');
  });

  // Step 8: Documentation
  section('📚 Documentation');

  log('Important files to read:', 'bright');
  log('  • README.md - Overview and usage', 'yellow');
  log('  • SETUP_GUIDE.md - Detailed setup instructions', 'yellow');
  log('  • API_REFERENCE.md - API endpoints reference', 'yellow');
  log('  • DEPLOYMENT.sh - Deployment checklist\n', 'yellow');

  // Final message
  section('✨ Setup Complete!');

  if (allConfigured) {
    log('Everything is ready! 🎉\n', 'green');
    log('Start the dashboard:', 'bright');
    log('  npm run dev-admin\n', 'green');
  } else {
    log('Some configuration needed\n', 'yellow');
    log('Once .env is configured, run:', 'bright');
    log('  npm run dev-admin\n', 'yellow');
  }

  log('Questions? Check the documentation files above', 'blue');
  log('\nHappy trading! 🚀\n', 'green');
}

main().catch(error => {
  log('\n✗ Setup failed: ' + error.message, 'red');
  process.exit(1);
});
