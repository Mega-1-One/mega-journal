const mongoose = require('mongoose');

const historicalCandleSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  timeframe: { type: String, required: true }, // '1m', '5m', '15m', '1h', '4h', '1d'
  timestamp: { type: Date, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, default: 0 },
}, { timestamps: true });

historicalCandleSchema.index({ symbol: 1, timeframe: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('HistoricalCandle', historicalCandleSchema);
