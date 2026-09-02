const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  broker: { type: String, default: 'EXNESS' },
  accountNumber: { type: String, default: '' },
  accountType: { type: String, enum: ['LIVE', 'DEMO', 'PROP_FIRM', 'PERSONAL'], default: 'PERSONAL' },
  startingBalance: { type: Number, required: true, default: 10000 },
  currentBalance: { type: Number, required: true, default: 10000 },
  currency: { type: String, default: 'USD' },
  leverage: { type: String, default: '1:100' },
  riskPerTrade: { type: Number, default: 1.0 }, // percentage
  profitTarget: { type: Number, default: 1000 },
  maxDailyLossLimit: { type: Number, default: 500 },
  maxTotalLossLimit: { type: Number, default: 1000 },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  source: { type: String, default: 'MANUAL' },
  connectionStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'SYNCING'], default: 'DISCONNECTED' },
  lastSyncedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
