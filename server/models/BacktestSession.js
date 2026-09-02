const mongoose = require('mongoose');

const backtestSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  market: { type: String, default: 'Forex' },
  timeframe: { type: String, default: '15m' },
  initialBalance: { type: Number, default: 10000 },
  currentBalance: { type: Number, default: 10000 },
  winRate: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('BacktestSession', backtestSessionSchema);
