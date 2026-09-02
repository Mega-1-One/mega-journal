const mongoose = require('mongoose');

const weeklyReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStartDate: { type: String, required: true },
  weekEndDate: { type: String, required: true },
  totalPnL: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  topMistake: { type: String, default: '' },
  topSuccess: { type: String, default: '' },
  rating: { type: Number, default: 4 },
  actionItems: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('WeeklyReview', weeklyReviewSchema);
