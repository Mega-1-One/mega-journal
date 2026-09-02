const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  market: { type: String, default: 'Forex' }, // 'Forex' | 'Crypto' | 'Indices' | 'Stocks'
  timeframe: { type: String, default: '15m' },
  session: { type: String, default: 'London & New York' },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  winRate: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  netPnL: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Strategy', strategySchema);
