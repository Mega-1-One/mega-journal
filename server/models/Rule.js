const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  strategyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Strategy', default: null },
  playbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook', default: null },
  ruleName: { type: String, required: true },
  ruleText: { type: String, required: true },
  category: { type: String, enum: ['PRE_TRADE', 'IN_TRADE', 'POST_TRADE', 'PSYCHOLOGY', 'RISK'], default: 'PRE_TRADE' },
  isRequired: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
