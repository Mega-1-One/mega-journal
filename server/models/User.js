const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: function() { return !this.googleId; } },
  name: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['TRADER', 'ADMIN'], default: 'TRADER' },
  isDemoUser: { type: Boolean, default: false },
  googleId: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  moodHistory: { type: [{ date: String, mood: String }], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
