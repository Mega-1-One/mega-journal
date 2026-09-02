const mongoose = require('mongoose');

const monthlyReportCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // e.g. "2026-09"
  startingEquity: { type: Number, default: 10000 },
  endingEquity: { type: Number, default: 10000 },
  totalPnL: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  grade: { type: String, default: 'A' }, // 'A+' | 'A' | 'B' | 'C' | 'F'
  summary: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MonthlyReportCard', monthlyReportCardSchema);
