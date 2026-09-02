const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notebookCategory: { type: String, default: 'General' },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  isPinned: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
