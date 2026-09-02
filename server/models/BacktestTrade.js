const mongoose = require('mongoose');

const backtestTradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BacktestSession', required: true },
  symbol: { type: String, required: true },
  direction: { type: String, enum: ['Long', 'Short'], required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  positionSize: { type: Number, required: true },
  netPnL: { type: Number, required: true },
  riskRewardRatio: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('BacktestTrade', backtestTradeSchema);
