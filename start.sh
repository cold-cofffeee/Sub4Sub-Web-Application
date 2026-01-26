#!/bin/bash

echo "========================================"
echo "SUB4SUB v2.0 - Quick Start Script"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/6] Checking Node.js version..."
node --version
echo ""

# Check if MongoDB is running
echo "[2/6] Checking MongoDB..."
if ! mongosh --eval "db.version()" &> /dev/null; then
    echo "[WARNING] MongoDB is not running!"
    echo "Attempting to start MongoDB..."
    
    # Try different methods to start MongoDB
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mongod
    elif command -v service &> /dev/null; then
        sudo service mongod start
    else
        echo "[ERROR] Could not start MongoDB automatically"
        echo "Please start MongoDB manually or install MongoDB Compass"
        echo "Download: https://www.mongodb.com/try/download/compass"
        exit 1
    fi
fi
echo "MongoDB is running"
echo ""

# Install dependencies
echo "[3/6] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi
echo ""

# Check if .env exists
echo "[4/6] Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "[WARNING] Please edit .env file with your settings"
fi
echo ""

# Run migration
echo "[5/6] Running database migration..."
npm run migrate
if [ $? -ne 0 ]; then
    echo "[ERROR] Database migration failed"
    exit 1
fi
echo ""

# Generate views
echo "[6/6] Generating view templates..."
node scripts/generate-views.js
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to generate views"
    exit 1
fi
echo ""

echo "========================================"
echo "Setup Complete! Ready to start."
echo "========================================"
echo ""
echo "Admin Credentials:"
echo "  Email: admin@sub4sub.com"
echo "  Password: admin123"
echo "  (CHANGE THIS AFTER FIRST LOGIN!)"
echo ""
echo "Starting server in 3 seconds..."
sleep 3

echo ""
echo "========================================"
echo "Starting SUB4SUB Server..."
echo "========================================"
echo ""
echo "Server will be available at:"
echo "  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
