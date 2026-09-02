const mongoose = require('mongoose');

const tradingBookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  author: { type: String, default: '' },
  category: { type: String, default: 'Psychology' },
  summary: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
}, { timestamps: true });

module.exports = mongoose.model('TradingBook', tradingBookSchema);
