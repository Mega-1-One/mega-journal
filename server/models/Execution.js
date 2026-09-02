const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['ENTRY', 'EXIT', 'PARTIAL_EXIT'], required: true },
  executionTime: { type: Date, default: Date.now },
  commission: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Execution', executionSchema);
