const mongoose = require('mongoose');

const onboardingProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tradingExperience: { type: String, default: 'INTERMEDIATE' }, // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO'
  primaryMarkets: [{ type: String }],
  tradingStyle: { type: String, default: 'DAY_TRADER' }, // 'DAY_TRADER' | 'SWING_TRADER' | 'SCALPER'
  primaryGoal: { type: String, default: 'Consistent monthly returns' },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('OnboardingProfile', onboardingProfileSchema);
