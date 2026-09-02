const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', default: null },
  playbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook', default: null },
  accountName: { type: String, default: 'Primary' },
  symbol: { type: String, required: true },
  assetClass: { type: String, enum: ['Forex', 'Crypto', 'Stocks', 'Indices', 'Commodities'], default: 'Forex' },
  direction: { type: String, enum: ['Long', 'Short'], required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  stopLoss: { type: Number, default: 0 },
  takeProfit: { type: Number, default: 0 },
  positionSize: { type: Number, required: true },
  netPnL: { type: Number, required: true },
  pnlPercentage: { type: Number, default: 0 },
  riskRewardRatio: { type: Number, default: 0 },
  entryDate: { type: Date, required: true, default: Date.now },
  exitDate: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['CLOSED', 'OPEN', 'PENDING', 'ARCHIVED'], default: 'CLOSED' },
  winLoss: { type: String, enum: ['WIN', 'LOSS', 'BREAKEVEN'], default: 'WIN' },
  session: { type: String, default: 'London' }, // 'London' | 'New York' | 'Asia'
  timeframe: { type: String, default: '15m' },
  emotion: { type: String, default: 'CALM' }, // 'CALM' | 'FOMO' | 'GREED' | 'ANXIETY' | 'REVENGE'
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
