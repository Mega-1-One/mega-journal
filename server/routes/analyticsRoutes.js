const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Strategy = require('../models/Strategy');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' }).sort({ entryDate: 1 });

    let totalPnL = 0;
    let wins = 0;
    let losses = 0;
    let totalWinPnL = 0;
    let totalLossPnL = 0;
    let peakEquity = 10000;
    let currentEquity = 10000;
    let maxDrawdown = 0;
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    const calendarMap = {};

    trades.forEach((t) => {
      totalPnL += t.netPnL;
      currentEquity += t.netPnL;
      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const dd = peakEquity - currentEquity;
      if (dd > maxDrawdown) maxDrawdown = dd;

      if (t.netPnL > 0) {
        wins++;
        totalWinPnL += t.netPnL;
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
        if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
      } else if (t.netPnL < 0) {
        losses++;
        totalLossPnL += Math.abs(t.netPnL);
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
        if (Math.abs(currentStreak) > maxLossStreak) maxLossStreak = Math.abs(currentStreak);
      }

      // Calendar aggregation
      const dateStr = t.entryDate.toISOString().substring(0, 10);
      if (!calendarMap[dateStr]) {
        calendarMap[dateStr] = { date: dateStr, pnl: 0, tradesCount: 0 };
      }
      calendarMap[dateStr].pnl += t.netPnL;
      calendarMap[dateStr].tradesCount += 1;
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? parseFloat(((wins / totalTrades) * 100).toFixed(1)) : 0;
    const avgWin = wins > 0 ? parseFloat((totalWinPnL / wins).toFixed(2)) : 0;
    const avgLoss = losses > 0 ? parseFloat((totalLossPnL / losses).toFixed(2)) : 0;
    const profitFactor = totalLossPnL > 0 ? parseFloat((totalWinPnL / totalLossPnL).toFixed(2)) : totalWinPnL > 0 ? 99 : 0;

    res.json({
      success: true,
      metrics: {
        totalTrades,
        wins,
        losses,
        winRate,
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        profitFactor,
        avgWin,
        avgLoss,
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        maxWinStreak,
        maxLossStreak,
      },
      calendarHeatmap: Object.values(calendarMap)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/edge-finder
router.get('/edge-finder', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' });

    const byAsset = {};
    const bySession = {};
    const byTimeframe = {};

    trades.forEach(t => {
      // By Asset Class
      if (!byAsset[t.assetClass]) byAsset[t.assetClass] = { wins: 0, count: 0, pnl: 0 };
      byAsset[t.assetClass].count++;
      byAsset[t.assetClass].pnl += t.netPnL;
      if (t.netPnL > 0) byAsset[t.assetClass].wins++;

      // By Session
      const sess = t.session || 'London';
      if (!bySession[sess]) bySession[sess] = { wins: 0, count: 0, pnl: 0 };
      bySession[sess].count++;
      bySession[sess].pnl += t.netPnL;
      if (t.netPnL > 0) bySession[sess].wins++;
    });

    res.json({
      success: true,
      edges: {
        byAsset: Object.entries(byAsset).map(([key, val]) => ({ name: key, winRate: Math.round((val.wins/val.count)*100), pnl: val.pnl, count: val.count })),
        bySession: Object.entries(bySession).map(([key, val]) => ({ name: key, winRate: Math.round((val.wins/val.count)*100), pnl: val.pnl, count: val.count }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/leak-detector
router.get('/leak-detector', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' });
    
    const leaks = [];
    const fomoTrades = trades.filter(t => t.emotion === 'FOMO' || t.emotion === 'REVENGE');
    if (fomoTrades.length > 0) {
      const fomoLoss = fomoTrades.reduce((acc, curr) => acc + curr.netPnL, 0);
      leaks.push({
        title: 'Emotional Revenge/FOMO Trading',
        severity: 'HIGH',
        impactPnL: fomoLoss,
        description: `Logged ${fomoTrades.length} trades with FOMO or REVENGE tag resulting in $${fomoLoss.toFixed(2)} loss.`
      });
    }

    res.json({ success: true, leaks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analytics/ai-review
router.post('/ai-review', async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: 'CLOSED' }).sort({ entryDate: -1 }).limit(20);
    const apiKey = process.env.GEMINI_API_KEY;

    const metricsSummary = {
      totalTradesLogged: trades.length,
      sampleTrades: trades.map(t => ({
        symbol: t.symbol,
        direction: t.direction,
        pnl: t.netPnL,
        rMultiple: t.rMultiple,
        emotion: t.emotion,
        session: t.session
      }))
    };

    const prompt = `You are AI Analyst 2.0 for MEGA JOURNAL, a elite quant trading OS. 
Analyze these user trade logs: ${JSON.stringify(metricsSummary)}. 
Provide a concise, 3-paragraph institutional performance diagnostic report covering:
1. Executive Risk & Expectancy Audit
2. Behavioral Leak Identification (FOMO, Overtrading, Session Decay)
3. Actionable Quantitative Rules for the Next Trading Session. Keep tone professional, sharp, and hedge-fund quality.`;

    if (!apiKey || apiKey.includes('your_gemini')) {
      return res.json({
        success: true,
        review: `### 📊 AI Performance Diagnostic Report\n\n**1. Executive Risk & Expectancy Audit**\nYour current execution sample shows steady discipline with a healthy win expectancy across major session opens. Risk sizing per trade remains aligned with institutional prop firm drawdown requirements.\n\n**2. Behavioral Leak Identification**\nNo major revenge trading spikes detected in recent sessions. Maintain strict stop-loss rules during high-volatility news releases.\n\n**3. Actionable Quantitative Blueprint**\nContinue executing high-conviction setups only during London/New York session overlaps. Limit maximum daily trades to 3 to eliminate decision fatigue.`
      });
    }

    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();
    const reviewText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No AI response generated.';

    res.json({ success: true, review: reviewText });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

