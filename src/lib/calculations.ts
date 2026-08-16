// Centralized Financial Calculations Engine for MEGA JOURNAL / MegaLedger

export interface StructuredNotes {
  whyEntered?: string;
  whatSaw?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lessonLearned?: string;
}

export interface TradeScreenshots {
  before?: string;
  entry?: string;
  exit?: string;
}

export interface TradeInput {
  id?: string;
  userId?: string;
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
  totalFees?: number;
  commission?: number;
  fees?: number;
  strategyId?: string;
  playbookId?: string;
  setup?: string;
  session?: string;
  tags?: string[];
  mistake?: string;
  emotion?: string;
  confidence?: number;
  rating?: number;
  notes?: string;
  structuredNotes?: StructuredNotes;
  screenshots?: TradeScreenshots;
  status?: 'ACTIVE' | 'ARCHIVED';
}

export interface TradeCalculated {
  id: string;
  userId: string;
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
  playbookId?: string;
  setup?: string;
  session?: string;
  tags: string[];
  mistake?: string;
  emotion?: string;
  confidence?: number;
  rating?: number;
  notes?: string;
  structuredNotes: StructuredNotes;
  screenshots: TradeScreenshots;
  status: 'ACTIVE' | 'ARCHIVED';
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
}

export interface AdherenceComparison {
  followed: {
    count: number;
    winRate: number;
    netPnL: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
  };
  violated: {
    count: number;
    winRate: number;
    netPnL: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
  };
}

export interface DrawdownDetails {
  peakBalance: number;
  currentBalance: number;
  currentDrawdownAmount: number;
  currentDrawdownPercent: number;
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  drawdownDurationTrades: number;
  recoveryDurationTrades: number;
  isRecovered: boolean;
}

export interface RDistributionBucket {
  label: string;
  count: number;
  color: string;
}

export interface WeekdayStat {
  day: string;
  trades: number;
  winRate: number;
  netPnL: number;
  averageR: number;
}

/**
 * Calculates trade financial metrics with fixed decimal rounding.
 */
export function calculateTradeMetrics(t: Partial<TradeInput>): TradeCalculated {
  const direction = t.direction || 'LONG';
  const entry = Number(t.entryPrice) || 0;
  const exit = Number(t.exitPrice) || 0;
  const qty = Number(t.quantity) || 1;
  const fees = (Number(t.totalFees) || 0) + (Number(t.commission) || 0) + (Number(t.fees) || 0);

  const sl = Number(t.stopLoss) || (direction === 'LONG' ? entry * 0.99 : entry * 1.01);
  const tp = Number(t.takeProfit) || (direction === 'LONG' ? entry * 1.02 : entry * 0.98);

  const asset = t.assetClass || 'COMMODITIES';

  // Gross P&L Calculation
  let rawGross = 0;
  if (asset === 'FOREX') {
    const lotSize = qty < 100 ? 100000 : 1;
    rawGross = direction === 'LONG' ? (exit - entry) * qty * lotSize : (entry - exit) * qty * lotSize;
  } else if (asset === 'FUTURES' || asset === 'INDICES') {
    const multiplier = t.symbol?.includes('NQ') || t.symbol?.includes('NAS') ? 20 : 50;
    rawGross = direction === 'LONG' ? (exit - entry) * qty * multiplier : (entry - exit) * qty * multiplier;
  } else {
    rawGross = direction === 'LONG' ? (exit - entry) * qty : (entry - exit) * qty;
  }

  const grossPnL = Math.round(rawGross * 100) / 100;
  const netPnL = Math.round((grossPnL - fees) * 100) / 100;

  // Risk calculation
  let riskPerUnit = direction === 'LONG' ? Math.max(0, entry - sl) : Math.max(0, sl - entry);
  if (riskPerUnit === 0) riskPerUnit = entry * 0.01;

  let initialRisk = 0;
  if (asset === 'FOREX') {
    initialRisk = Math.round(riskPerUnit * qty * (qty < 100 ? 100000 : 1) * 100) / 100;
  } else if (asset === 'FUTURES' || asset === 'INDICES') {
    const multiplier = t.symbol?.includes('NQ') || t.symbol?.includes('NAS') ? 20 : 50;
    initialRisk = Math.round(riskPerUnit * qty * multiplier * 100) / 100;
  } else {
    initialRisk = Math.round(riskPerUnit * qty * 100) / 100;
  }

  // Reward calculation
  let rewardPerUnit = direction === 'LONG' ? Math.max(0, tp - entry) : Math.max(0, entry - tp);
  let initialReward = 0;
  if (asset === 'FOREX') {
    initialReward = Math.round(rewardPerUnit * qty * (qty < 100 ? 100000 : 1) * 100) / 100;
  } else if (asset === 'FUTURES' || asset === 'INDICES') {
    const multiplier = t.symbol?.includes('NQ') || t.symbol?.includes('NAS') ? 20 : 50;
    initialReward = Math.round(rewardPerUnit * qty * multiplier * 100) / 100;
  } else {
    initialReward = Math.round(rewardPerUnit * qty * 100) / 100;
  }

  const riskRewardRatio = initialRisk > 0 ? Math.round((initialReward / initialRisk) * 100) / 100 : 0;
  const rMultiple = initialRisk > 0 ? Math.round((netPnL / initialRisk) * 100) / 100 : 0;

  const capital = entry * qty;
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
    userId: t.userId || 'usr-demo',
    account: t.account || 'MEGA1 $10K Prop Account',
    symbol: t.symbol || 'XAUUSD',
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
    playbookId: t.playbookId,
    setup: t.setup || 'General Setup',
    session: t.session || 'NEW_YORK',
    tags: t.tags || ['Liquidity Sweep', 'London Killzone'],
    mistake: t.mistake || 'None',
    emotion: t.emotion || 'Calm',
    confidence: t.confidence || 8,
    rating: t.rating || 5,
    notes: t.notes || '',
    structuredNotes: t.structuredNotes || {
      whyEntered: 'Swept liquidity into 15m Fair Value Gap.',
      whatSaw: '5m Market Structure Shift with high volume displacement.',
      whatWentWell: 'Waited patiently for 50% FVG retrace entry.',
      whatWentWrong: 'No major execution mistakes.',
      lessonLearned: 'Sticking to pre-market bias yields high expectancy.',
    },
    screenshots: t.screenshots || {},
    status: t.status || 'ACTIVE',
  };
}

/**
 * Calculates aggregate portfolio stats safely across non-archived trades.
 */
export function calculateAnalyticsSummary(trades: TradeCalculated[], initialBalance: number = 10000): AnalyticsSummary {
  const activeTrades = trades.filter((t) => t.status !== 'ARCHIVED');
  const totalTrades = activeTrades.length;

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
    };
  }

  const winningTradesList = activeTrades.filter((t) => t.isWin);
  const losingTradesList = activeTrades.filter((t) => t.isLoss);
  const breakEvenTradesList = activeTrades.filter((t) => t.isBreakEven);

  const winningTrades = winningTradesList.length;
  const losingTrades = losingTradesList.length;
  const breakEvenTrades = breakEvenTradesList.length;

  const winRate = Math.round((winningTrades / totalTrades) * 1000) / 10;
  const lossRate = Math.round((losingTrades / totalTrades) * 1000) / 10;

  const grossProfit = Math.round(winningTradesList.reduce((acc, t) => acc + t.netPnL, 0) * 100) / 100;
  const grossLoss = Math.round(Math.abs(losingTradesList.reduce((acc, t) => acc + t.netPnL, 0)) * 100) / 100;
  const netPnL = Math.round((grossProfit - grossLoss) * 100) / 100;
  const totalFees = Math.round(activeTrades.reduce((acc, t) => acc + t.totalFees, 0) * 100) / 100;

  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 99.9 : 0;

  const averageWin = winningTrades > 0 ? Math.round((grossProfit / winningTrades) * 100) / 100 : 0;
  const averageLoss = losingTrades > 0 ? Math.round((grossLoss / losingTrades) * 100) / 100 : 0;

  const expectancy = Math.round(((winRate / 100) * averageWin - (lossRate / 100) * averageLoss) * 100) / 100;
  const averageR = Math.round((activeTrades.reduce((acc, t) => acc + t.rMultiple, 0) / totalTrades) * 100) / 100;

  const payoffRatio = averageLoss > 0 ? Math.round((averageWin / averageLoss) * 100) / 100 : averageWin > 0 ? 99 : 0;

  let currentBalance = initialBalance;
  let peakBalance = initialBalance;
  let maxDrawdownAmount = 0;
  let maxDrawdownPercent = 0;

  let winStreakCount = 0;
  let lossStreakCount = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  activeTrades.forEach((t) => {
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

  maxDrawdownAmount = Math.round(maxDrawdownAmount * 100) / 100;
  maxDrawdownPercent = Math.round(maxDrawdownPercent * 100) / 100;

  const recoveryFactor = maxDrawdownAmount > 0 ? Math.round((netPnL / maxDrawdownAmount) * 100) / 100 : 99;

  const returns = activeTrades.map((t) => t.returnPercentage);
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
    currentWinStreak: winStreakCount,
    currentLossStreak: lossStreakCount,
    maxWinStreak,
    maxLossStreak,
  };
}

/**
 * Calculates Rules Followed vs Rules Violated Performance Split
 */
export function calculateAdherencePerformance(trades: TradeCalculated[]): AdherenceComparison {
  const activeTrades = trades.filter((t) => t.status !== 'ARCHIVED');

  const followedTrades = activeTrades.filter((t) => t.mistake === 'None' && (t.rating || 5) >= 4);
  const violatedTrades = activeTrades.filter((t) => t.mistake !== 'None' || (t.rating || 5) < 4);

  const followedSummary = calculateAnalyticsSummary(followedTrades);
  const violatedSummary = calculateAnalyticsSummary(violatedTrades);

  return {
    followed: {
      count: followedSummary.totalTrades,
      winRate: followedSummary.winRate,
      netPnL: followedSummary.netPnL,
      averageR: followedSummary.averageR,
      profitFactor: followedSummary.profitFactor,
      expectancy: followedSummary.expectancy,
    },
    violated: {
      count: violatedSummary.totalTrades,
      winRate: violatedSummary.winRate,
      netPnL: violatedSummary.netPnL,
      averageR: violatedSummary.averageR,
      profitFactor: violatedSummary.profitFactor,
      expectancy: violatedSummary.expectancy,
    },
  };
}

/**
 * Calculates Peak-to-Trough Drawdown Details
 */
export function calculateDrawdownDetails(trades: TradeCalculated[], startingBalance: number = 10000): DrawdownDetails {
  const activeTrades = trades.filter((t) => t.status !== 'ARCHIVED');
  let currentBal = startingBalance;
  let peakBal = startingBalance;
  let maxDD = 0;
  let maxDDPct = 0;
  let ddDuration = 0;
  let recDuration = 0;

  activeTrades.forEach((t) => {
    currentBal += t.netPnL;
    if (currentBal >= peakBal) {
      peakBal = currentBal;
      if (ddDuration > 0) {
        recDuration += 1;
      }
    } else {
      const dd = peakBal - currentBal;
      const ddPct = (dd / peakBal) * 100;
      ddDuration += 1;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;
    }
  });

  const currDD = Math.max(0, peakBal - currentBal);
  const currDDPct = peakBal > 0 ? (currDD / peakBal) * 100 : 0;

  return {
    peakBalance: Math.round(peakBal * 100) / 100,
    currentBalance: Math.round(currentBal * 100) / 100,
    currentDrawdownAmount: Math.round(currDD * 100) / 100,
    currentDrawdownPercent: Math.round(currDDPct * 100) / 100,
    maxDrawdownAmount: Math.round(maxDD * 100) / 100,
    maxDrawdownPercent: Math.round(maxDDPct * 100) / 100,
    drawdownDurationTrades: ddDuration,
    recoveryDurationTrades: recDuration,
    isRecovered: currentBal >= peakBal,
  };
}

/**
 * Calculates R-Multiple Distribution Histogram Buckets
 */
export function calculateRDistribution(trades: TradeCalculated[]): RDistributionBucket[] {
  const activeTrades = trades.filter((t) => t.status !== 'ARCHIVED');

  const buckets: RDistributionBucket[] = [
    { label: '< -2R', count: 0, color: '#EF4444' },
    { label: '-2R to -1R', count: 0, color: '#EF4444' },
    { label: '-1R to 0R', count: 0, color: '#F59E0B' },
    { label: '0R (BE)', count: 0, color: '#6F767D' },
    { label: '0R to +1R', count: 0, color: '#C8FF00' },
    { label: '+1R to +2R', count: 0, color: '#C8FF00' },
    { label: '> +2R', count: 0, color: '#C8FF00' },
  ];

  activeTrades.forEach((t) => {
    const r = t.rMultiple;
    if (r < -2) buckets[0].count++;
    else if (r >= -2 && r < -1) buckets[1].count++;
    else if (r >= -1 && r < 0) buckets[2].count++;
    else if (r === 0) buckets[3].count++;
    else if (r > 0 && r <= 1) buckets[4].count++;
    else if (r > 1 && r <= 2) buckets[5].count++;
    else if (r > 2) buckets[6].count++;
  });

  return buckets;
}

/**
 * Calculates Weekday Performance Breakdown
 */
export function calculateWeekdayPerformance(trades: TradeCalculated[]): WeekdayStat[] {
  const activeTrades = trades.filter((t) => t.status !== 'ARCHIVED');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return days.map((dayName, idx) => {
    // 0 is Sun, 1 is Mon
    const targetDayIndex = idx + 1;
    const dayTrades = activeTrades.filter((t) => new Date(t.entryTime).getDay() === targetDayIndex);
    const summary = calculateAnalyticsSummary(dayTrades);
    return {
      day: dayName,
      trades: summary.totalTrades,
      winRate: summary.winRate,
      netPnL: summary.netPnL,
      averageR: summary.averageR,
    };
  });
}
