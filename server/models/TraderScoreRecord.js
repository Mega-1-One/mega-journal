const mongoose = require('mongoose');

const traderScoreRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  overallScore: { type: Number, default: 85 },
  executionScore: { type: Number, default: 90 },
  riskScore: { type: Number, default: 80 },
  disciplineScore: { type: Number, default: 88 },
  consistencyScore: { type: Number, default: 82 },
}, { timestamps: true });

module.exports = mongoose.model('TraderScoreRecord', traderScoreRecordSchema);
