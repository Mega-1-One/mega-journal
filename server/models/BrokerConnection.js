const mongoose = require('mongoose');

const brokerConnectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  brokerName: { type: String, required: true }, // 'EXNESS' | 'MT5' | 'MT4' | 'BINANCE' | 'BYBIT'
  apiKey: { type: String, default: '' },
  apiSecret: { type: String, default: '' },
  server: { type: String, default: '' },
  connectionStatus: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'], default: 'CONNECTED' },
  lastSyncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('BrokerConnection', brokerConnectionSchema);
