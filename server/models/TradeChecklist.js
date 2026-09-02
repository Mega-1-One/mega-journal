const mongoose = require('mongoose');

const tradeChecklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rule', required: true },
  ruleText: { type: String, required: true },
  isPassed: { type: Boolean, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TradeChecklist', tradeChecklistSchema);
