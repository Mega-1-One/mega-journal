const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trade = require('../models/Trade');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply both middlewares to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - High level platform metrics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const demoUsers = await User.countDocuments({ isDemoUser: true });
    const realUsers = totalUsers - demoUsers;
    const totalTrades = await Trade.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        realUsers,
        demoUsers,
        totalTrades
      }
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    
    // For each user, maybe get their trade count efficiently?
    // Using an aggregation pipeline if we wanted, but for now we'll just return the users list.
    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('Admin Users List Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/role - Update a user's role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['TRADER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const targetUserId = req.params.id;
    
    // Prevent an admin from removing their own admin rights accidentally via this endpoint
    if (targetUserId === req.user._id.toString() && role !== 'ADMIN') {
      return res.status(400).json({ success: false, error: 'Cannot remove your own admin rights here' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error('Admin Update Role Error:', err);
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// DELETE /api/admin/users/:id - Delete a user and their data
router.delete('/users/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot delete yourself' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Delete their trades (and potentially accounts)
    await Trade.deleteMany({ userId: targetUserId });
    const Account = require('../models/Account');
    await Account.deleteMany({ userId: targetUserId });
    
    // Delete user
    await User.findByIdAndDelete(targetUserId);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin Delete User Error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

module.exports = router;
