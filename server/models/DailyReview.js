const mongoose = require('mongoose');

const dailyReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  tradesExecuted: { type: Number, default: 0 },
  totalPnL: { type: Number, default: 0 },
  ruleAdherenceScore: { type: Number, default: 90 },
  keyTakeaway: { type: String, default: '' },
  psychologicalState: { type: String, default: 'FOCUSED' },
  rating: { type: Number, default: 5 }, // 1-5
}, { timestamps: true });

module.exports = mongoose.model('DailyReview', dailyReviewSchema);
