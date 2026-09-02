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

// POST /api/trades/import - Batch CSV/JSON Import (MUST be before /:id route)
router.post('/import', async (req, res) => {
  try {
    const { trades: importList } = req.body;
    if (!Array.isArray(importList) || importList.length === 0) {
      return res.status(400).json({ success: false, error: 'No trades provided in import list' });
    }

    const createdTrades = [];
    for (const item of importList) {
      const pnl = item.netPnL !== undefined ? parseFloat(item.netPnL) : (item.direction === 'Long' ? (item.exitPrice - item.entryPrice) * item.positionSize : (item.entryPrice - item.exitPrice) * item.positionSize);
      const t = await Trade.create({
        userId: req.user._id,
        symbol: item.symbol || 'EURUSD',
        assetClass: item.assetClass || 'Forex',
        direction: item.direction || 'Long',
        entryPrice: parseFloat(item.entryPrice || 1.0),
        exitPrice: parseFloat(item.exitPrice || 1.0),
        positionSize: parseFloat(item.positionSize || 1),
        netPnL: parseFloat(pnl.toFixed(2)),
        winLoss: pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAKEVEN'),
        entryDate: item.entryDate ? new Date(item.entryDate) : new Date(),
        exitDate: item.exitDate ? new Date(item.exitDate) : new Date(),
        notes: item.notes || 'Imported via CSV/JSON',
      });
      createdTrades.push(t);
    }

    res.json({ success: true, importedCount: createdTrades.length, trades: createdTrades });
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

// POST /api/trades - Create trade
router.post('/', async (req, res) => {
  try {
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
    if (stopLoss && entryPrice && stopLoss !== entryPrice) {
      const risk = Math.abs(entryPrice - stopLoss);
      const reward = Math.abs((exitPrice || entryPrice) - entryPrice);
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

    // Update account balance
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

// PUT /api/trades/:id - Update trade
router.put('/:id', async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!trade) return res.status(404).json({ success: false, error: 'Trade not found' });
    res.json({ success: true, trade });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/trades/:id - Archive or delete trade
router.delete('/:id', async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trade) return res.status(404).json({ success: false, error: 'Trade not found' });
    await Execution.deleteMany({ tradeId: trade._id });
    res.json({ success: true, message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
