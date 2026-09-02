const mongoose = require('mongoose');

const tradingPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Primary Trading Plan' },
  preferredMarkets: { type: String, default: 'NAS100, XAUUSD, EURUSD' },
  preferredSessions: { type: String, default: 'London, New York' },
  riskPerTrade: { type: Number, default: 1.0 },
  maxDailyRisk: { type: Number, default: 2.0 },
  maxTradesPerDay: { type: Number, default: 3 },
  aPlusCriteria: { type: String, default: 'Liquidity sweep + M5 MSS + Displacement into FVG' },
  entryRules: { type: String, default: 'Wait for candle close inside FVG after liquidity sweep' },
  stopLossRules: { type: String, default: 'Place SL 2 pips beyond local swing high/low' },
  takeProfitRules: { type: String, default: 'Target opposing liquidity pool or minimum 1:2 R/R' },
  forbiddenBehaviors: { type: String, default: 'No revenge trading. No SL moving into loss.' },
  psychologyRules: { type: String, default: 'Take 15 minute breather after any losing trade.' },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('TradingPlan', tradingPlanSchema);
