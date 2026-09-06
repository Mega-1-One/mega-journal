const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Execution = require('../models/Execution');
const Account = require('../models/Account');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/trades - List trades with filtering and search
router.get('/', async (req, res) => {
  try {
    const { symbol, direction, assetClass, status, search, limit } = req.query;
    let query = { userId: req.user._id };

    if (symbol && symbol !== 'ALL') query.symbol = symbol;
    if (direction && direction !== 'ALL') query.direction = direction;
    if (assetClass && assetClass !== 'ALL') query.assetClass = assetClass;
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let tradeQuery = Trade.find(query).sort({ entryDate: -1 });
    if (limit) tradeQuery = tradeQuery.limit(parseInt(limit));

    const trades = await tradeQuery.exec();
    res.json({ success: true, count: trades.length, trades });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trades/export - Backup Export JSON (MUST be before /:id route)
router.get('/export', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id });
    res.json({ success: true, exportedAt: new Date(), count: trades.length, trades });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trades/import - Batch CSV/JSON Import with Deduplication & Tier Check
router.post('/import', async (req, res) => {
  try {
    const { trades: importList } = req.body;
    if (!Array.isArray(importList) || importList.length === 0) {
      return res.status(400).json({ success: false, error: 'No trades provided in import list' });
    }

    // Check Free tier trade cap (50 trades max)
    const existingTradeCount = await Trade.countDocuments({ userId: req.user._id });
    const userTier = req.user.planTier || 'FREE';
    if (userTier === 'FREE' && (existingTradeCount + importList.length > 50) && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Free Tier Limit Exceeded: Max 50 trades allowed on Free plan. Current count: ${existingTradeCount}. Please upgrade to Pro for unlimited trades.`
      });
    }

    const createdTrades = [];
    let skippedDuplicates = 0;

    for (const item of importList) {
      const entryDate = item.entryDate ? new Date(item.entryDate) : new Date();
      const entryPrice = parseFloat(item.entryPrice || 1.0);
      const exitPrice = parseFloat(item.exitPrice || 1.0);
      const positionSize = parseFloat(item.positionSize || 1);
      const symbol = (item.symbol || 'EURUSD').toUpperCase();

      // Deduplication check: match exact trade parameters for user
      const existing = await Trade.findOne({
        userId: req.user._id,
        symbol,
        entryPrice,
        exitPrice,
        positionSize,
        entryDate
      });

      if (existing) {
        skippedDuplicates++;
        continue;
      }

      const pnl = item.netPnL !== undefined
        ? parseFloat(item.netPnL)
        : (item.direction === 'Long' ? (exitPrice - entryPrice) * positionSize : (entryPrice - exitPrice) * positionSize);

      const t = await Trade.create({
        userId: req.user._id,
        symbol,
        assetClass: item.assetClass || 'Forex',
        direction: item.direction || 'Long',
        entryPrice,
        exitPrice,
        positionSize,
        netPnL: parseFloat(pnl.toFixed(2)),
        winLoss: pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAKEVEN'),
        entryDate,
        exitDate: item.exitDate ? new Date(item.exitDate) : new Date(),
        notes: item.notes || 'Imported via CSV/JSON',
      });
      createdTrades.push(t);
    }

    res.json({
      success: true,
      importedCount: createdTrades.length,
      skippedDuplicates,
      trades: createdTrades
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trades/:id - Single trade details
router.get('/:id', async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trade) return res.status(404).json({ success: false, error: 'Trade not found' });
    const executions = await Execution.find({ tradeId: trade._id });
    res.json({ success: true, trade, executions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trades - Create trade with tier enforcement & account balance update
router.post('/', async (req, res) => {
  try {
    // Check Free Tier trade limit (50 trades)
    const existingTradeCount = await Trade.countDocuments({ userId: req.user._id });
    const userTier = req.user.planTier || 'FREE';
    if (userTier === 'FREE' && existingTradeCount >= 50 && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Free Tier Limit Reached: Max 50 trades allowed on Free plan. Upgrade to Pro for unlimited trades.'
      });
    }

    const { symbol, assetClass, direction, entryPrice, exitPrice, stopLoss, takeProfit, positionSize, netPnL, entryDate, exitDate, emotion, notes, tags } = req.body;

    let pnl = netPnL;
    if (pnl === undefined || pnl === null) {
      if (direction === 'Long') {
        pnl = (exitPrice - entryPrice) * positionSize;
      } else {
        pnl = (entryPrice - exitPrice) * positionSize;
      }
    }

    const winLoss = pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAKEVEN');
    let rrRatio = 0;
    if (stopLoss && entryPrice && parseFloat(stopLoss) !== parseFloat(entryPrice)) {
      const risk = Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss));
      const reward = Math.abs((parseFloat(exitPrice) || parseFloat(entryPrice)) - parseFloat(entryPrice));
      rrRatio = parseFloat((reward / risk).toFixed(2));
    }

    const trade = await Trade.create({
      userId: req.user._id,
      symbol: symbol ? symbol.toUpperCase() : 'EURUSD',
      assetClass: assetClass || 'Forex',
      direction: direction || 'Long',
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      stopLoss: stopLoss ? parseFloat(stopLoss) : 0,
      takeProfit: takeProfit ? parseFloat(takeProfit) : 0,
      positionSize: parseFloat(positionSize),
      netPnL: parseFloat(pnl.toFixed(2)),
      winLoss,
      riskRewardRatio: rrRatio,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      exitDate: exitDate ? new Date(exitDate) : new Date(),
      emotion: emotion || 'CALM',
      notes: notes || '',
      tags: tags || [],
    });

    // Update active account balance
    const account = await Account.findOne({ userId: req.user._id, status: 'ACTIVE' });
    if (account && typeof account.currentBalance === 'number') {
      account.currentBalance = Number(account.currentBalance) + Number(trade.netPnL);
      await account.save();
    }

    // Auto-create initial executions
    await Execution.create([
      { userId: req.user._id, tradeId: trade._id, price: trade.entryPrice, quantity: trade.positionSize, type: 'ENTRY', executionTime: trade.entryDate },
      { userId: req.user._id, tradeId: trade._id, price: trade.exitPrice, quantity: trade.positionSize, type: 'EXIT', executionTime: trade.exitDate }
    ]);

    res.json({ success: true, trade });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/trades/:id - Update trade with P&L and account balance sync
router.put('/:id', async (req, res) => {
  try {
    const existingTrade = await Trade.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existingTrade) return res.status(404).json({ success: false, error: 'Trade not found' });

    const oldPnL = existingTrade.netPnL || 0;
    const updateData = { ...req.body };

    // Recalculate P&L if price fields are present
    if (updateData.entryPrice !== undefined && updateData.exitPrice !== undefined && updateData.positionSize !== undefined) {
      const dir = updateData.direction || existingTrade.direction;
      let pnl;
      if (dir === 'Long') {
        pnl = (parseFloat(updateData.exitPrice) - parseFloat(updateData.entryPrice)) * parseFloat(updateData.positionSize);
      } else {
        pnl = (parseFloat(updateData.entryPrice) - parseFloat(updateData.exitPrice)) * parseFloat(updateData.positionSize);
      }
      updateData.netPnL = parseFloat(pnl.toFixed(2));
      updateData.winLoss = pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAKEVEN');

      if (updateData.stopLoss && updateData.entryPrice && parseFloat(updateData.stopLoss) !== parseFloat(updateData.entryPrice)) {
        const risk = Math.abs(parseFloat(updateData.entryPrice) - parseFloat(updateData.stopLoss));
        const reward = Math.abs(parseFloat(updateData.exitPrice) - parseFloat(updateData.entryPrice));
        updateData.riskRewardRatio = parseFloat((reward / risk).toFixed(2));
      }
    }

    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updateData },
      { new: true }
    );

    // Sync account balance with P&L delta
    const newPnL = trade.netPnL || 0;
    const pnlDelta = newPnL - oldPnL;
    if (pnlDelta !== 0) {
      const account = await Account.findOne({ userId: req.user._id, status: 'ACTIVE' });
      if (account && typeof account.currentBalance === 'number') {
        account.currentBalance = Number(account.currentBalance) + pnlDelta;
        await account.save();
      }
    }

    res.json({ success: true, trade });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/trades/:id - Archive or delete trade with account balance sync
router.delete('/:id', async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trade) return res.status(404).json({ success: false, error: 'Trade not found' });
    await Execution.deleteMany({ tradeId: trade._id });

    // Revert deleted trade P&L from active account balance
    const account = await Account.findOne({ userId: req.user._id, status: 'ACTIVE' });
    if (account && typeof account.currentBalance === 'number') {
      account.currentBalance = Number(account.currentBalance) - Number(trade.netPnL || 0);
      await account.save();
    }

    res.json({ success: true, message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
