// Simple Express.js server for Vercel
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.APP_ORIGIN || 'https://www.modahaus.co.za',
    'http://localhost:3000'
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Configured' : 'Missing',
    appOrigin: process.env.APP_ORIGIN || 'https://www.modahaus.co.za'
  });
});

// Simple API test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      appOrigin: process.env.APP_ORIGIN,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing'
    }
  });
});

module.exports = app;