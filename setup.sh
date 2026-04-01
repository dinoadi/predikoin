#!/bin/bash

# Bitcoin Predictor - Deployment Script

set -e

echo "🚀 Bitcoin Predictor - Deployment Setup"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and fill in your API keys"
    exit 1
fi

echo "✅ .env file found"

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies installed"

# Get Appwrite environment
read -p "Enter Appwrite endpoint (default: http://localhost/v1): " APPWRITE_ENDPOINT
APPWRITE_ENDPOINT=${APPWRITE_ENDPOINT:-http://localhost/v1}

read -p "Enter Appwrite project ID: " APPWRITE_PROJECT_ID
read -p "Enter Appwrite API key: " APPWRITE_API_KEY

# Update .env
echo "🔧 Updating .env file..."
sed -i "s|APPWRITE_API_ENDPOINT=.*|APPWRITE_API_ENDPOINT=$APPWRITE_ENDPOINT|" .env
sed -i "s|APPWRITE_PROJECT_ID=.*|APPWRITE_PROJECT_ID=$APPWRITE_PROJECT_ID|" .env
sed -i "s|APPWRITE_API_KEY=.*|APPWRITE_API_KEY=$APPWRITE_API_KEY|" .env

# Verify functions
echo "🔍 Verifying functions..."
for func in functions/*.js; do
    echo "✅ $(basename $func)"
done

# List utilities
echo "📚 Utilities:"
for util in utils/*.js; do
    echo "✅ $(basename $util)"
done

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Deploy functions: npm run deploy"
echo "2. Test functions: node test-requests.js"
echo "3. Send TradingView alerts to: http://your-domain/functions/tradingview_webhook"
echo ""
echo "📖 See README.md for full documentation"
