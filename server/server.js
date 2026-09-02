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

// Serverless Cached Database Connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB Atlas Connected Successfully');
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      console.error('MongoDB Connection Error:', err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection Middleware for API routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
      next();
    } catch (err) {
      console.error('DB middleware failed:', err);
      return res.status(500).json({ success: false, error: 'Database Connection Error: ' + err.message });
    }
  } else {
    next();
  }
});

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
