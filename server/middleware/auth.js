const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_jwt_secret_key_12345_mega_journal';
const DEMO_PASSWORD = 'demopass123';

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Handle Demo Mode fallback
    if (!token && (req.headers['x-demo-mode'] === 'true' || req.query.demo === 'true')) {
      let demoUser = await User.findOne({ email: 'demo@megajournal.com' });
      if (!demoUser) {
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
        demoUser = await User.create({
          email: 'demo@megajournal.com',
          username: 'demo_trader',
          passwordHash,
          name: 'Demo Trader',
          isDemoUser: true,
        });
      }
      req.user = demoUser;
      return next();
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
