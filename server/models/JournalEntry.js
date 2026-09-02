const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  title: { type: String, required: true },
  content: { type: String, default: '' },
  mood: { type: String, default: 'CONFIDENT' }, // 'CONFIDENT' | 'NEUTRAL' | 'FRUSTRATED' | 'ANXIOUS'
  tags: [{ type: String }],
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
