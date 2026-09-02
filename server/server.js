require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

// Express App
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ameyukeba175_db_user:7znYSrjPXEx639Qn@cluster0.s4fxl3w.mongodb.net/?appName=Cluster0';

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files (No Cache for Development)
app.use(express.static(path.join(__dirname, '../public'), {
  etag: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/trades', require('./routes/tradeRoutes'));
app.use('/api', require('./routes/strategyRoutes')); // strategies, rules, playbooks
app.use('/api', require('./routes/journalRoutes')); // journal, notes, books
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/backtest', require('./routes/backtestRoutes'));
app.use('/api', require('./routes/goalRoutes')); // goals, risk
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/brokers', require('./routes/brokerRoutes'));
app.use('/api/ai-analyst', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api', require('./routes/settingsRoutes')); // settings, onboarding, admin

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// SPA Fallback Middleware
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server (Local) or Export (Vercel)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MEGA JOURNAL server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
