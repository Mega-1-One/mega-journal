require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Account = require('./models/Account');
const Strategy = require('./models/Strategy');
const Playbook = require('./models/Playbook');
const Rule = require('./models/Rule');
const Trade = require('./models/Trade');
const Execution = require('./models/Execution');
const Goal = require('./models/Goal');
const JournalEntry = require('./models/JournalEntry');
const Note = require('./models/Note');
const TradingPlan = require('./models/TradingPlan');
const PreMarketPlan = require('./models/PreMarketPlan');
const DailyReview = require('./models/DailyReview');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ameyukeba175_db_user:7znYSrjPXEx639Qn@cluster0.s4fxl3w.mongodb.net/?appName=Cluster0';

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    // Clear existing sample user & data
    const existingUser = await User.findOne({ email: 'demo@megajournal.com' });
    if (existingUser) {
      await User.deleteOne({ _id: existingUser._id });
      await Account.deleteMany({ userId: existingUser._id });
      await Strategy.deleteMany({ userId: existingUser._id });
      await Playbook.deleteMany({ userId: existingUser._id });
      await Rule.deleteMany({ userId: existingUser._id });
      await Trade.deleteMany({ userId: existingUser._id });
      await Execution.deleteMany({ userId: existingUser._id });
      await Goal.deleteMany({ userId: existingUser._id });
      await JournalEntry.deleteMany({ userId: existingUser._id });
      await Note.deleteMany({ userId: existingUser._id });
    }

    const passwordHash = await bcrypt.hash('demopass123', 12);
    const demoUser = await User.create({
      email: 'demo@megajournal.com',
      username: 'demo_trader',
      passwordHash,
      name: 'Demo Trader',
      role: 'TRADER',
      isDemoUser: true
    });

    console.log('Created Demo User:', demoUser.email);

    // Account
    const demoAccount = await Account.create({
      userId: demoUser._id,
      name: 'Exness Pro Account',
      broker: 'EXNESS',
      accountType: 'PROP_FIRM',
      startingBalance: 100000,
      currentBalance: 114250,
      currency: 'USD',
      leverage: '1:100',
      riskPerTrade: 1.0,
      profitTarget: 10000,
      maxDailyLossLimit: 5000,
      maxTotalLossLimit: 10000
    });

    // Strategy
    const strategy = await Strategy.create({
      userId: demoUser._id,
      name: 'ICT Silver Bullet & Liquidity Sweeps',
      description: 'London & NY Killzone liquidity sweeps with M5 Fair Value Gap retracement.',
      market: 'Indices & Forex',
      timeframe: '5m',
      session: 'London & NY',
      winRate: 68.5,
      totalTrades: 24,
      netPnL: 14250
    });

    // Playbook
    const playbook = await Playbook.create({
      userId: demoUser._id,
      strategyId: strategy._id,
      name: 'NY Open Sweep & FVG Model',
      description: 'Sweep 9:30 AM liquidity, wait for MSS, enter on first FVG touch.',
      market: 'Indices',
      symbols: 'NAS100, US30, SPX500',
      entryModel: 'M5 FVG Touch',
      stopModel: 'Swing High/Low',
      targetModel: '1:2.5 R/R',
      minRiskReward: 2.0
    });

    // Rules
    await Rule.create([
      { userId: demoUser._id, strategyId: strategy._id, ruleName: 'Never risk > 1%', ruleText: 'Risk per trade must stay strictly at 1% of total equity.', category: 'RISK' },
      { userId: demoUser._id, strategyId: strategy._id, ruleName: 'Wait for 5m MSS', ruleText: 'Do not enter before a clear Market Structure Shift on 5m chart.', category: 'PRE_TRADE' },
      { userId: demoUser._id, strategyId: strategy._id, ruleName: 'No news trading', ruleText: 'Do not hold open positions 10 mins before CPI or NFP.', category: 'RISK' },
    ]);

    // Sample Trades
    const sampleTradeData = [
      { symbol: 'NAS100', direction: 'Long', entryPrice: 19850, exitPrice: 19980, posSize: 5, pnl: 6500, winLoss: 'WIN', date: new Date('2026-08-25T14:30:00Z'), notes: 'Clean NY open sweep of Asian High.' },
      { symbol: 'EURUSD', direction: 'Short', entryPrice: 1.0850, exitPrice: 1.0810, posSize: 10, pnl: 4000, winLoss: 'WIN', date: new Date('2026-08-26T08:15:00Z'), notes: 'London killzone FVG entry.' },
      { symbol: 'XAUUSD', direction: 'Long', entryPrice: 2510, exitPrice: 2498, posSize: 2, pnl: -2400, winLoss: 'LOSS', date: new Date('2026-08-27T13:45:00Z'), notes: 'Stopped out before news release.' },
      { symbol: 'NAS100', direction: 'Long', entryPrice: 19910, exitPrice: 20035, posSize: 4, pnl: 5000, winLoss: 'WIN', date: new Date('2026-08-28T15:00:00Z'), notes: 'Silver Bullet setup executed flawlessly.' },
      { symbol: 'GBPUSD', direction: 'Short', entryPrice: 1.3120, exitPrice: 1.3108, posSize: 10, pnl: 1200, winLoss: 'WIN', date: new Date('2026-08-29T10:00:00Z'), notes: 'Partial profit taken at key support.' },
      { symbol: 'US30', direction: 'Long', entryPrice: 41200, exitPrice: 41180, posSize: 1, pnl: -200, winLoss: 'LOSS', date: new Date('2026-08-30T16:00:00Z'), notes: 'Minor loss on range contraction.' },
      { symbol: 'NAS100', direction: 'Short', entryPrice: 20050, exitPrice: 20025, posSize: 6, pnl: 1500, winLoss: 'WIN', date: new Date('2026-08-31T14:15:00Z'), notes: 'End of month distribution.' }
    ];

    for (const data of sampleTradeData) {
      const trade = await Trade.create({
        userId: demoUser._id,
        accountId: demoAccount._id,
        strategyId: strategy._id,
        playbookId: playbook._id,
        symbol: data.symbol,
        assetClass: data.symbol === 'EURUSD' || data.symbol === 'GBPUSD' ? 'Forex' : 'Indices',
        direction: data.direction,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        stopLoss: data.entryPrice * 0.995,
        takeProfit: data.entryPrice * 1.015,
        positionSize: data.posSize,
        netPnL: data.pnl,
        winLoss: data.winLoss,
        riskRewardRatio: 2.2,
        entryDate: data.date,
        exitDate: new Date(data.date.getTime() + 45 * 60000),
        notes: data.notes,
        emotion: 'CALM',
        tags: ['ICT', 'LiquiditySweep', 'SilverBullet']
      });

      await Execution.create([
        { userId: demoUser._id, tradeId: trade._id, price: data.entryPrice, quantity: data.posSize, type: 'ENTRY', executionTime: data.date },
        { userId: demoUser._id, tradeId: trade._id, price: data.exitPrice, quantity: data.posSize, type: 'EXIT', executionTime: new Date(data.date.getTime() + 45 * 60000) }
      ]);
    }

    // Goals
    await Goal.create([
      { userId: demoUser._id, title: 'Achieve 15% Monthly Return', targetValue: 15, currentValue: 14.2, unit: '%', deadline: '2026-09-30' },
      { userId: demoUser._id, title: 'Maintain > 90% Rule Adherence', targetValue: 90, currentValue: 94, unit: '%', deadline: '2026-09-30' },
    ]);

    // Journal Entry & Notes
    await JournalEntry.create({
      userId: demoUser._id,
      date: '2026-09-01',
      title: 'Monthly Review & Strategy Alignment',
      content: 'August finished with a strong +14.2% return. Key lesson: focus strictly on NY Open Silver Bullet setup.',
      mood: 'CONFIDENT',
      tags: ['Review', 'Monthly']
    });

    await Note.create({
      userId: demoUser._id,
      notebookCategory: 'ICT Playbook',
      title: 'Silver Bullet Execution Steps',
      content: '1. Identify Liquidity Sweep on 15m\n2. Shift to 5m for Market Structure Shift\n3. Mark Fair Value Gap\n4. Set limit order at 50% FVG',
      isPinned: true
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
}

seed();
