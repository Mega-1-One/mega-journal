const mongoose = require('mongoose');

const playbookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  market: { type: String, default: 'Forex' },
  symbols: { type: String, default: 'EURUSD, GBPUSD, NAS100' },
  sessions: { type: String, default: 'London, New York' },
  timeframes: { type: String, default: '15m, 5m' },
  entryModel: { type: String, default: 'FVG Retracement' },
  stopModel: { type: String, default: 'Swing High/Low' },
  targetModel: { type: String, default: '1:2 R/R' },
  minRiskReward: { type: Number, default: 2.0 },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Playbook', playbookSchema);
