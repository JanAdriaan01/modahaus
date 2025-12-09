#!/bin/bash

# Modahaus E-commerce Platform - Quick Start Script
echo "🏠 Modahaus E-commerce Platform Setup"
echo "======================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."

# Install root dependencies
if npm install; then
    echo "✅ Root dependencies installed"
else
    echo "❌ Failed to install root dependencies"
    exit 1
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
if cd server && npm install; then
    echo "✅ Server dependencies installed"
    cd ..
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
if cd client && npm install; then
    echo "✅ Client dependencies installed"
    cd ..
else
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env"
else
    echo "ℹ️  Server .env already exists"
fi

if [ ! -f client/.env ]; then
    echo "VITE_API_URL=http://localhost:5000/api" > client/.env
    echo "✅ Created client/.env"
else
    echo "ℹ️  Client .env already exists"
fi

# Seed database
echo "🗄️  Seeding database..."
if cd server && npm run seed; then
    echo "✅ Database seeded successfully"
    cd ..
else
    echo "⚠️  Database seeding failed - you may need to run it manually later"
    cd ..
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Run: npm run dev"
echo "2. Frontend will be available at: http://localhost:3000"
echo "3. Backend API will be available at: http://localhost:5000"
echo ""
echo "📚 Check README.md for detailed documentation"