const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, default: '%' },
  deadline: { type: String, default: '' },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ARCHIVED'], default: 'IN_PROGRESS' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
