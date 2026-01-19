#!/bin/bash

echo "🚀 WBM Automation Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install
echo ""

# Check if Chrome is installed (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "/Applications/Google Chrome.app" ]; then
        echo "✅ Google Chrome is installed"
    else
        echo "⚠️  Google Chrome not found at /Applications/Google Chrome.app"
        echo "Please install Google Chrome from https://www.google.com/chrome/"
        echo ""
        echo "Alternative: If Chrome is installed elsewhere, selenium-webdriver will try to find it"
    fi
else
    echo "ℹ️  Non-macOS system detected - please ensure Google Chrome is installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
