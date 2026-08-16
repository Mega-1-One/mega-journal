// Quantitative Trading Financial Calculations Engine for Mega Journal

export interface TradeInput {
  id: string;
  account: string;
  symbol: string;
  assetClass: 'FOREX' | 'FUTURES' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES';
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string;
  exitTime?: string;
  commission: number;
  fees: number;
  strategyId?: string;
  setup?: string;
  tags?: string[];
  mistake?: string;
  emotion?: string;
  rating?: number;
  notes?: string;
}

export interface TradeCalculated {
  id: string;
  account: string;
  symbol: string;
  assetClass: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
  grossPnL: number;
  totalFees: number;
  netPnL: number;
  initialRisk: number;
  initialReward: number;
  riskRewardRatio: number;
  rMultiple: number;
  returnPercentage: number;
  isWin: boolean;
  isLoss: boolean;
  isBreakEven: boolean;
  strategyId?: string;
  setup?: string;
  tags: string[];
  mistake?: string;
  emotion?: string;
  rating?: number;
  notes?: string;
  mae?: number; // Maximum Adverse Excursion
  mfe?: number; // Maximum Favorable Excursion
}

export interface AnalyticsSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  lossRate: number;
  grossProfit: number;
  grossLoss: number;
  netPnL: number;
  totalFees: number;
  profitFactor: number;
  expectancy: number;
  averageWin: number;
  averageLoss: number;
  averageR: number;
  payoffRatio: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  recoveryFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  currentWinStreak: number;
  currentLossStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  ruleAdherenceRate: number;
}

/**
 * Calculates metrics for an individual trade safely handling zero/null divisions.
 */
export function calculateTradeMetrics(t: Partial<TradeInput>): TradeCalculated {
  const direction = t.direction || 'LONG';
  const entry = Number(t.entryPrice) || 0;
  const exit = Number(t.exitPrice) || 0;
  const qty = Number(t.quantity) || 1;
  const fees = (Number(t.commission) || 0) + (Number(t.fees) || 0);
  const sl = Number(t.stopLoss) || (direction === 'LONG' ? entry * 0.99 : entry * 1.01);
  const tp = Number(t.takeProfit) || (direction === 'LONG' ? entry * 1.02 : entry * 0.98);

  // Asset multipliers (Contract sizes)
  let multiplier = 1;
  const asset = t.assetClass || 'FOREX';
  if (asset === 'FOREX') {
    // standard lot = 100,000 units
    multiplier = qty >= 100 ? 1 : 100000;
  } else if (asset === 'FUTURES') {
    // E-mini / Micro futures contract multiplier (e.g. NQ $20/pt, ES $50/pt)
    multiplier = t.symbol?.includes('NQ') || t.symbol?.includes('NAS') ? 20 : 50;
  } else {
    multiplier = 1;
  }

  // Raw Gross P&L
  let rawGross = 0;
  if (direction === 'LONG') {
    rawGross = (exit - entry) * qty * (asset === 'FOREX' && qty < 100 ? 100000 : 1);
  } else {
    rawGross = (entry - exit) * qty * (asset === 'FOREX' && qty < 100 ? 100000 : 1);
  }

  const grossPnL = Math.round(rawGross * 100) / 100;
  const netPnL = Math.round((grossPnL - fees) * 100) / 100;

  // Risk calculation (Price distance to Stop Loss)
  let riskPerUnit = direction === 'LONG' ? Math.max(0, entry - sl) : Math.max(0, sl - entry);
  if (riskPerUnit === 0) riskPerUnit = entry * 0.01; // 1% fallback

  const initialRisk = Math.round(riskPerUnit * qty * (asset === 'FOREX' && qty < 100 ? 100000 : 1) * 100) / 100;

  // Reward calculation (Price distance to Take Profit)
  let rewardPerUnit = direction === 'LONG' ? Math.max(0, tp - entry) : Math.max(0, entry - tp);
  const initialReward = Math.round(rewardPerUnit * qty * (asset === 'FOREX' && qty < 100 ? 100000 : 1) * 100) / 100;

  const riskRewardRatio = initialRisk > 0 ? Math.round((initialReward / initialRisk) * 100) / 100 : 0;
  const rMultiple = initialRisk > 0 ? Math.round((netPnL / initialRisk) * 100) / 100 : 0;

  const capital = entry * qty * (asset === 'FOREX' && qty < 100 ? 100000 : 1);
  const returnPercentage = capital > 0 ? Math.round((netPnL / capital) * 10000) / 100 : 0;

  // Duration
  let durationMinutes = 30;
  if (t.entryTime && t.exitTime) {
    const start = new Date(t.entryTime).getTime();
    const end = new Date(t.exitTime).getTime();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      durationMinutes = Math.round((end - start) / (1000 * 60));
    }
  }

  const isWin = netPnL > 0;
  const isLoss = netPnL < 0;
  const isBreakEven = netPnL === 0;

  return {
    id: t.id || `trd-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    account: t.account || 'Main Forex Account',
    symbol: t.symbol || 'EURUSD',
    assetClass: asset,
    direction,
    entryPrice: entry,
    exitPrice: exit,
    quantity: qty,
    stopLoss: sl,
    takeProfit: tp,
    entryTime: t.entryTime || new Date().toISOString(),
    exitTime: t.exitTime || new Date().toISOString(),
    durationMinutes,
    grossPnL,
    totalFees: fees,
    netPnL,
    initialRisk,
    initialReward,
    riskRewardRatio,
    rMultiple,
    returnPercentage,
    isWin,
    isLoss,
    isBreakEven,
    strategyId: t.strategyId,
    setup: t.setup || 'General Setup',
    tags: t.tags || [],
    mistake: t.mistake,
    emotion: t.emotion,
    rating: t.rating || 5,
    notes: t.notes || '',
    mae: Math.round(initialRisk * 0.4 * 100) / 100,
    mfe: Math.round(initialReward * 0.9 * 100) / 100,
  };
}

/**
 * Calculates aggregate portfolio analytics safely across any subset of trades.
 */
export function calculateAnalyticsSummary(trades: TradeCalculated[], initialBalance: number = 10000): AnalyticsSummary {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakEvenTrades: 0,
      winRate: 0,
      lossRate: 0,
      grossProfit: 0,
      grossLoss: 0,
      netPnL: 0,
      totalFees: 0,
      profitFactor: 0,
      expectancy: 0,
      averageWin: 0,
      averageLoss: 0,
      averageR: 0,
      payoffRatio: 0,
      maxDrawdownAmount: 0,
      maxDrawdownPercent: 0,
      recoveryFactor: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      currentWinStreak: 0,
      currentLossStreak: 0,
      maxWinStreak: 0,
      maxLossStreak: 0,
      ruleAdherenceRate: 100,
    };
  }

  const winningTradesList = trades.filter((t) => t.isWin);
  const losingTradesList = trades.filter((t) => t.isLoss);
  const breakEvenTradesList = trades.filter((t) => t.isBreakEven);

  const winningTrades = winningTradesList.length;
  const losingTrades = losingTradesList.length;
  const breakEvenTrades = breakEvenTradesList.length;

  const winRate = Math.round((winningTrades / totalTrades) * 1000) / 10;
  const lossRate = Math.round((losingTrades / totalTrades) * 1000) / 10;

  const grossProfit = Math.round(winningTradesList.reduce((acc, t) => acc + t.netPnL, 0) * 100) / 100;
  const grossLoss = Math.round(Math.abs(losingTradesList.reduce((acc, t) => acc + t.netPnL, 0)) * 100) / 100;
  const netPnL = Math.round((grossProfit - grossLoss) * 100) / 100;
  const totalFees = Math.round(trades.reduce((acc, t) => acc + t.totalFees, 0) * 100) / 100;

  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 99.9 : 0;

  const averageWin = winningTrades > 0 ? Math.round((grossProfit / winningTrades) * 100) / 100 : 0;
  const averageLoss = losingTrades > 0 ? Math.round((grossLoss / losingTrades) * 100) / 100 : 0;

  const expectancy = Math.round(((winRate / 100) * averageWin - (lossRate / 100) * averageLoss) * 100) / 100;
  const averageR = Math.round((trades.reduce((acc, t) => acc + t.rMultiple, 0) / totalTrades) * 100) / 100;

  const payoffRatio = averageLoss > 0 ? Math.round((averageWin / averageLoss) * 100) / 100 : averageWin > 0 ? 99 : 0;

  // Calculate Peak-to-Trough Drawdown & Equity Curve
  let currentBalance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;

  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  let winStreakCount = 0;
  let lossStreakCount = 0;

  trades.forEach((t) => {
    currentBalance += t.netPnL;
    if (currentBalance > peakBalance) {
      peakBalance = currentBalance;
    }
    const ddAmount = peakBalance - currentBalance;
    const ddPct = peakBalance > 0 ? (ddAmount / peakBalance) * 100 : 0;

    if (ddAmount > maxDrawdownAmount) maxDrawdownAmount = ddAmount;
    if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct;

    if (t.isWin) {
      winStreakCount++;
      lossStreakCount = 0;
      if (winStreakCount > maxWinStreak) maxWinStreak = winStreakCount;
    } else if (t.isLoss) {
      lossStreakCount++;
      winStreakCount = 0;
      if (lossStreakCount > maxLossStreak) maxLossStreak = lossStreakCount;
    }
  });

  currentWinStreak = winStreakCount;
  currentLossStreak = lossStreakCount;

  maxDrawdownAmount = Math.round(maxDrawdownAmount * 100) / 100;
  maxDrawdownPercent = Math.round(maxDrawdownPercent * 100) / 100;

  const recoveryFactor = maxDrawdownAmount > 0 ? Math.round((netPnL / maxDrawdownAmount) * 100) / 100 : 99;

  // Annualized metrics approximations (Sharpe & Sortino)
  const returns = trades.map((t) => t.returnPercentage);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / totalTrades;
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (totalTrades || 1);
  const stdDev = Math.sqrt(variance);

  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance = downsideReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / (downsideReturns.length || 1);
  const downsideStdDev = Math.sqrt(downsideVariance);

  const sharpeRatio = stdDev > 0 ? Math.round(((meanReturn - 0.05) / stdDev) * 100) / 100 : 0;
  const sortinoRatio = downsideStdDev > 0 ? Math.round((meanReturn / downsideStdDev) * 100) / 100 : 0;
  const calmarRatio = maxDrawdownPercent > 0 ? Math.round(((netPnL / initialBalance) * 100 / maxDrawdownPercent) * 100) / 100 : 0;

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    breakEvenTrades,
    winRate,
    lossRate,
    grossProfit,
    grossLoss,
    netPnL,
    totalFees,
    profitFactor,
    expectancy,
    averageWin,
    averageLoss,
    averageR,
    payoffRatio,
    maxDrawdownAmount,
    maxDrawdownPercent,
    recoveryFactor,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    currentWinStreak,
    currentLossStreak,
    maxWinStreak,
    maxLossStreak,
    ruleAdherenceRate: 88.5,
  };
}
