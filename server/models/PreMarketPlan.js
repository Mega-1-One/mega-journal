const mongoose = require('mongoose');

const preMarketPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  marketBias: { type: String, default: 'BULLISH' }, // 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  keyLevels: { type: String, default: '' },
  newsEvents: { type: String, default: '' },
  plannedSetups: { type: String, default: '' },
  readinessScore: { type: Number, default: 80 },
  status: { type: String, enum: ['COMPLETED', 'PENDING'], default: 'COMPLETED' },
}, { timestamps: true });

module.exports = mongoose.model('PreMarketPlan', preMarketPlanSchema);
