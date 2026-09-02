const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  period: { type: String, default: 'Monthly' },
  metricsSummary: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
