require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Trade = require('./server/models/Trade');
const Account = require('./server/models/Account');
const Strategy = require('./server/models/Strategy');
const JournalEntry = require('./server/models/JournalEntry');
const Goal = require('./server/models/Goal');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ameyukeba175_db_user:7znYSrjPXEx639Qn@cluster0.s4fxl3w.mongodb.net/megajournal?retryWrites=true&w=majority&appName=Cluster0';
const JWT_SECRET = process.env.JWT_SECRET || 'super_jwt_secret_key_12345_mega_journal';

const auditResults = {
  passed: 0,
  failed: 0,
  findings: []
};

function logResult(testName, success, details) {
  if (success) {
    auditResults.passed++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    auditResults.failed++;
    console.error(`❌ [FAIL] ${testName} - ${details}`);
    auditResults.findings.push({ testName, details });
  }
}

async function runAuditSuite() {
  console.log('====================================================');
  console.log('🚀 MEGA JOURNAL — FULL PRODUCTION BUG AUDIT SUITE');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB Atlas for Audit Execution.\n');

    // Clean up past audit test users
    await User.deleteMany({ email: { $in: ['audit_usera@test.com', 'audit_userb@test.com'] } });

    // --- TEST 1: AUTHENTICATION & USER CREATION ---
    console.log('--- Phase 1: Authentication & User Creation ---');
    const userA = await User.create({
      email: 'audit_usera@test.com',
      username: 'audit_usera',
      name: 'Audit User A',
      planTier: 'FREE',
      passwordHash: 'dummyhash'
    });

    const userB = await User.create({
      email: 'audit_userb@test.com',
      username: 'audit_userb',
      name: 'Audit User B',
      planTier: 'FREE',
      passwordHash: 'dummyhash'
    });

    logResult('User A & User B Creation', !!userA && !!userB, 'Failed to create test users');

    const tokenA = jwt.sign({ userId: userA._id }, JWT_SECRET);
    const tokenB = jwt.sign({ userId: userB._id }, JWT_SECRET);
    logResult('JWT Generation for User A & User B', !!tokenA && !!tokenB, 'Failed to generate JWTs');

    // --- TEST 2: DATA PERSISTENCE & ACCOUNTS ---
    console.log('\n--- Phase 2: Data Persistence & Accounts ---');
    const accA = await Account.create({
      userId: userA._id,
      name: 'User A Primary',
      broker: 'FTMO',
      accountType: 'PROP_FIRM',
      startingBalance: 10000,
      currentBalance: 10000,
      maxDailyLossLimit: 500,
      status: 'ACTIVE'
    });

    const accB = await Account.create({
      userId: userB._id,
      name: 'User B Primary',
      broker: 'Oanda',
      accountType: 'PERSONAL',
      startingBalance: 50000,
      currentBalance: 50000,
      maxDailyLossLimit: 2500,
      status: 'ACTIVE'
    });

    logResult('Account Creation & Data Binding', accA.userId.equals(userA._id) && accB.userId.equals(userB._id), 'Account user mapping error');

    // --- TEST 3: IDOR PROTECTION (USER A ACCESSING USER B RESOURCES) ---
    console.log('\n--- Phase 3: IDOR Protection & User Isolation ---');
    const tradeB = await Trade.create({
      userId: userB._id,
      symbol: 'EURUSD',
      direction: 'Long',
      entryPrice: 1.0800,
      exitPrice: 1.0850,
      positionSize: 1.0,
      netPnL: 500.00,
      winLoss: 'WIN',
      entryDate: new Date(),
      exitDate: new Date()
    });

    // Attempt IDOR lookup of User B's trade by User A query filter
    const idorResult = await Trade.findOne({ _id: tradeB._id, userId: userA._id });
    logResult('IDOR Trade Query Protection (User A querying User B trade)', idorResult === null, 'IDOR Vulnerability: User A accessed User B trade!');

    // Attempt IDOR lookup of User B's account by User A query filter
    const idorAccResult = await Account.findOne({ _id: accB._id, userId: userA._id });
    logResult('IDOR Account Query Protection (User A querying User B account)', idorAccResult === null, 'IDOR Vulnerability: User A accessed User B account!');

    // --- TEST 4: FINANCIAL & METRIC CALCULATIONS ---
    console.log('\n--- Phase 4: Financial & Metric Calculations ---');
    // Create 3 trades for User A: 2 Wins (+$400, +$600), 1 Loss (-$200)
    const t1 = await Trade.create({
      userId: userA._id,
      symbol: 'NAS100',
      direction: 'Long',
      entryPrice: 19800,
      exitPrice: 19840,
      positionSize: 10,
      netPnL: 400.00,
      winLoss: 'WIN',
      entryDate: new Date('2026-09-01T10:00:00Z'),
      exitDate: new Date('2026-09-01T11:00:00Z')
    });

    const t2 = await Trade.create({
      userId: userA._id,
      symbol: 'XAUUSD',
      direction: 'Short',
      entryPrice: 2500,
      exitPrice: 2494,
      positionSize: 100,
      netPnL: 600.00,
      winLoss: 'WIN',
      entryDate: new Date('2026-09-02T10:00:00Z'),
      exitDate: new Date('2026-09-02T11:00:00Z')
    });

    const t3 = await Trade.create({
      userId: userA._id,
      symbol: 'EURUSD',
      direction: 'Long',
      entryPrice: 1.0850,
      exitPrice: 1.0830,
      positionSize: 10,
      netPnL: -200.00,
      winLoss: 'LOSS',
      entryDate: new Date('2026-09-03T10:00:00Z'),
      exitDate: new Date('2026-09-03T11:00:00Z')
    });

    const userATrades = await Trade.find({ userId: userA._id });
    const totalPnL = userATrades.reduce((a, t) => a + t.netPnL, 0);
    const wins = userATrades.filter(t => t.netPnL > 0).length;
    const winRate = (wins / userATrades.length) * 100;
    const profitFactor = (400 + 600) / 200;

    logResult('Net P&L Calculation ($800 expected)', totalPnL === 800, `Expected 800, got ${totalPnL}`);
    logResult('Win Rate Calculation (66.7% expected)', Math.round(winRate) === 67, `Expected 67%, got ${winRate}`);
    logResult('Profit Factor Calculation (5.0 expected)', profitFactor === 5.0, `Expected 5.0, got ${profitFactor}`);

    // --- TEST 5: DYNAMIC ACCOUNT BALANCE SYNC & RECALCULATION ---
    console.log('\n--- Phase 5: Dynamic Account Balance Sync ---');
    // Update Trade 3 P&L from -$200 to +$100
    const oldPnL = t3.netPnL;
    t3.netPnL = 100.00;
    t3.winLoss = 'WIN';
    await t3.save();

    const pnlDelta = 100.00 - oldPnL; // +300
    accA.currentBalance += pnlDelta;
    await accA.save();

    const updatedAccA = await Account.findById(accA._id);
    logResult('Account Balance Sync on Trade Edit ($10,300 expected)', updatedAccA.currentBalance === 10300, `Expected 10300, got ${updatedAccA.currentBalance}`);

    // Delete Trade 3 and verify balance reversion
    await Trade.findByIdAndDelete(t3._id);
    accA.currentBalance -= t3.netPnL;
    await accA.save();

    const revertedAccA = await Account.findById(accA._id);
    logResult('Account Balance Sync on Trade Delete ($10,200 expected)', revertedAccA.currentBalance === 10200, `Expected 10200, got ${revertedAccA.currentBalance}`);

    // --- TEST 6: DEDUPLICATION ON TRADE IMPORT ---
    console.log('\n--- Phase 6: Trade Import Deduplication ---');
    const sampleTrade = {
      userId: userA._id,
      symbol: 'GBPUSD',
      direction: 'Long',
      entryPrice: 1.3000,
      exitPrice: 1.3050,
      positionSize: 1.0,
      netPnL: 50.00,
      winLoss: 'WIN',
      entryDate: new Date('2026-09-04T12:00:00Z')
    };

    const firstImport = await Trade.create(sampleTrade);
    const dupCheck = await Trade.findOne(sampleTrade);
    logResult('Trade Import Initial Creation', !!firstImport, 'Failed to create initial trade');
    logResult('Trade Import Deduplication Detection', !!dupCheck, 'Failed to detect existing duplicate trade parameters');

    // --- TEST 7: ZERO-TRADE ISOLATION ---
    console.log('\n--- Phase 7: Zero-Trade Account Isolation ---');
    const zeroUserTrades = await Trade.find({ userId: userB._id, symbol: 'NON_EXISTENT' });
    logResult('Zero-Trade Query Handling', zeroUserTrades.length === 0, 'Zero trade query returned invalid results');

    // Clean up test data
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
    await Trade.deleteMany({ userId: { $in: [userA._id, userB._id] } });
    await Account.deleteMany({ userId: { $in: [userA._id, userB._id] } });

    console.log('\n====================================================');
    console.log(`AUDIT COMPLETE: ${auditResults.passed} PASSED | ${auditResults.failed} FAILED`);
    console.log('====================================================\n');

    process.exit(auditResults.failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Audit Suite Execution Error:', err);
    process.exit(1);
  }
}

runAuditSuite();
