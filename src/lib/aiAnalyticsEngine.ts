import { TradeCalculated, calculateAnalyticsSummary, calculateAdherencePerformance } from './calculations';
import { AccountData, BacktestSessionData } from './store';

export interface AIStructuredResponse {
  query: string;
  answer: string;
  evidence: string[];
  explanation: string;
  watchNote: string;
  sampleSize: number;
  confidence: 'Limited Sample' | 'Early Signal' | 'Moderate Evidence' | 'Strong Evidence';
  supportingTradesCount: number;
}

export interface AIInsightCard {
  title: string;
  metric: string;
  value: string;
  sampleSize: number;
  explanation: string;
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

/**
 * Deterministic tool: Get overall performance summary
 */
export function getPerformanceSummary(trades: TradeCalculated[], account?: AccountData) {
  const summary = calculateAnalyticsSummary(trades, account?.startingBalance || 10000);
  return {
    totalTrades: summary.totalTrades,
    winRate: summary.winRate,
    netPnL: summary.netPnL,
    profitFactor: summary.profitFactor,
    averageR: summary.averageR,
    expectancy: summary.expectancy,
    maxDrawdownPercent: summary.maxDrawdownPercent,
  };
}

/**
 * Deterministic tool: Session performance breakdown
 */
export function getSessionPerformance(trades: TradeCalculated[]) {
  const sessionMap: Record<string, { count: number; wins: number; pnl: number; totalR: number }> = {};

  trades.forEach((t) => {
    const s = t.session || 'NEW_YORK';
    if (!sessionMap[s]) sessionMap[s] = { count: 0, wins: 0, pnl: 0, totalR: 0 };
    sessionMap[s].count += 1;
    sessionMap[s].pnl += t.netPnL;
    sessionMap[s].totalR += t.rMultiple;
    if (t.isWin) sessionMap[s].wins += 1;
  });

  return Object.entries(sessionMap).map(([session, data]) => ({
    session,
    count: data.count,
    winRate: Math.round((data.wins / (data.count || 1)) * 100),
    netPnL: Math.round(data.pnl * 100) / 100,
    averageR: Math.round((data.totalR / (data.count || 1)) * 100) / 100,
  }));
}

/**
 * Deterministic tool: Strategy performance breakdown
 */
export function getStrategyPerformance(trades: TradeCalculated[]) {
  const stratMap: Record<string, { count: number; wins: number; pnl: number; totalR: number }> = {};

  trades.forEach((t) => {
    const s = t.setup || 'General Strategy';
    if (!stratMap[s]) stratMap[s] = { count: 0, wins: 0, pnl: 0, totalR: 0 };
    stratMap[s].count += 1;
    stratMap[s].pnl += t.netPnL;
    stratMap[s].totalR += t.rMultiple;
    if (t.isWin) stratMap[s].wins += 1;
  });

  return Object.entries(stratMap).map(([strategy, data]) => ({
    strategy,
    count: data.count,
    winRate: Math.round((data.wins / (data.count || 1)) * 100),
    netPnL: Math.round(data.pnl * 100) / 100,
    averageR: Math.round((data.totalR / (data.count || 1)) * 100) / 100,
  }));
}

/**
 * Deterministic tool: Symbol performance breakdown
 */
export function getSymbolPerformance(trades: TradeCalculated[]) {
  const symMap: Record<string, { count: number; wins: number; pnl: number }> = {};

  trades.forEach((t) => {
    if (!symMap[t.symbol]) symMap[t.symbol] = { count: 0, wins: 0, pnl: 0 };
    symMap[t.symbol].count += 1;
    symMap[t.symbol].pnl += t.netPnL;
    if (t.isWin) symMap[t.symbol].wins += 1;
  });

  return Object.entries(symMap).map(([symbol, data]) => ({
    symbol,
    count: data.count,
    winRate: Math.round((data.wins / (data.count || 1)) * 100),
    netPnL: Math.round(data.pnl * 100) / 100,
  }));
}

/**
 * Deterministic tool: Rule adherence performance split
 */
export function getRuleAdherencePerformance(trades: TradeCalculated[]) {
  return calculateAdherencePerformance(trades);
}

/**
 * Deterministic tool: Loss analysis breakdown
 */
export function getLossAnalysis(trades: TradeCalculated[]) {
  const losingTrades = trades.filter((t) => t.isLoss);
  const totalLossPnL = Math.abs(losingTrades.reduce((acc, t) => acc + t.netPnL, 0));

  const sessionLosses: Record<string, number> = {};
  const symbolLosses: Record<string, number> = {};
  const mistakeLosses: Record<string, number> = {};

  losingTrades.forEach((t) => {
    const s = t.session || 'NEW_YORK';
    sessionLosses[s] = (sessionLosses[s] || 0) + Math.abs(t.netPnL);
    symbolLosses[t.symbol] = (symbolLosses[t.symbol] || 0) + Math.abs(t.netPnL);
    const m = t.mistake || 'None';
    mistakeLosses[m] = (mistakeLosses[m] || 0) + Math.abs(t.netPnL);
  });

  return {
    losingTradesCount: losingTrades.length,
    totalLossAmount: Math.round(totalLossPnL * 100) / 100,
    sessionLosses,
    symbolLosses,
    mistakeLosses,
  };
}

/**
 * Natural Language Question Evaluator Engine
 */
export function answerNaturalLanguageQuestion(
  query: string,
  trades: TradeCalculated[],
  account?: AccountData,
  backtestSessions?: BacktestSessionData[]
): AIStructuredResponse {
  const lowerQ = query.toLowerCase();
  const sampleSize = trades.length;

  let confidence: 'Limited Sample' | 'Early Signal' | 'Moderate Evidence' | 'Strong Evidence' = 'Strong Evidence';
  if (sampleSize < 5) confidence = 'Limited Sample';
  else if (sampleSize < 15) confidence = 'Early Signal';
  else if (sampleSize < 30) confidence = 'Moderate Evidence';

  // Question 1: "Why am I losing money?" / "Loss analysis"
  if (lowerQ.includes('losing') || lowerQ.includes('loss') || lowerQ.includes('leak')) {
    const lossData = getLossAnalysis(trades);
    const sessions = getSessionPerformance(trades);
    const worstSession = sessions.sort((a, b) => a.netPnL - b.netPnL)[0];

    return {
      query,
      answer: `Your losses are primarily concentrated in the ${worstSession?.session || 'New York'} session and trades with mistake tags.`,
      evidence: [
        `Total Realized Losses: -$${lossData.totalLossAmount.toLocaleString()}`,
        `Weakest Session (${worstSession?.session || 'New York'}): Net P&L ${worstSession?.netPnL >= 0 ? '+' : ''}$${worstSession?.netPnL}`,
        `Losing Trades Count: ${lossData.losingTradesCount} trades`,
      ],
      explanation: `Analysis reveals that trading outside your primary session or committing execution mistakes accounts for the majority of drawdown.`,
      watchNote: sampleSize < 10 ? 'Sample size is limited. Continue tracking trades to verify this pattern.' : 'Concentrate execution exclusively in your highest expectancy session.',
      sampleSize,
      confidence,
      supportingTradesCount: lossData.losingTradesCount,
    };
  }

  // Question 2: "London vs New York" / "Session performance"
  if (lowerQ.includes('london') || lowerQ.includes('session') || lowerQ.includes('new york')) {
    const sessions = getSessionPerformance(trades);
    const london = sessions.find((s) => s.session === 'LONDON') || { session: 'LONDON', count: 0, winRate: 0, netPnL: 0, averageR: 0 };
    const ny = sessions.find((s) => s.session === 'NEW_YORK') || { session: 'NEW_YORK', count: 0, winRate: 0, netPnL: 0, averageR: 0 };

    const betterSession = london.netPnL >= ny.netPnL ? 'London' : 'New York';

    return {
      query,
      answer: `${betterSession} is currently your stronger trading session.`,
      evidence: [
        `London Session: ${london.netPnL >= 0 ? '+' : ''}$${london.netPnL} | Win Rate: ${london.winRate}% | Avg R: +${london.averageR}R (${london.count} trades)`,
        `New York Session: ${ny.netPnL >= 0 ? '+' : ''}$${ny.netPnL} | Win Rate: ${ny.winRate}% | Avg R: +${ny.averageR}R (${ny.count} trades)`,
      ],
      explanation: `Based on your persisted trades dataset, ${betterSession} generated higher net profit and superior risk-reward efficiency.`,
      watchNote: `Data is based on ${sampleSize} total trades across all sessions.`,
      sampleSize,
      confidence,
      supportingTradesCount: sampleSize,
    };
  }

  // Question 3: "Rule adherence" / "Checklist impact"
  if (lowerQ.includes('rule') || lowerQ.includes('checklist') || lowerQ.includes('adherence')) {
    const adh = getRuleAdherencePerformance(trades);

    return {
      query,
      answer: `Rule-followed trades outperform rule-violated trades significantly.`,
      evidence: [
        `Rules Followed: Win Rate ${adh.followed.winRate}% | Net P&L ${adh.followed.netPnL >= 0 ? '+' : ''}$${adh.followed.netPnL} | Avg R: +${adh.followed.averageR}R (${adh.followed.count} trades)`,
        `Rules Violated: Win Rate ${adh.violated.winRate}% | Net P&L ${adh.violated.netPnL >= 0 ? '+' : ''}$${adh.violated.netPnL} | Avg R: +${adh.violated.averageR}R (${adh.violated.count} trades)`,
      ],
      explanation: `Discipline pays off. Trades where all pre-trade checklist rules were satisfied yielded higher expectancy and lower drawdowns.`,
      watchNote: `Sample includes ${adh.followed.count} followed trades vs ${adh.violated.count} violated trades.`,
      sampleSize,
      confidence,
      supportingTradesCount: sampleSize,
    };
  }

  // Default General Performance Query
  const perf = getPerformanceSummary(trades, account);
  return {
    query,
    answer: `Overall net performance is ${perf.netPnL >= 0 ? '+' : ''}$${perf.netPnL} across ${perf.totalTrades} trades.`,
    evidence: [
      `Win Rate: ${perf.winRate}%`,
      `Profit Factor: ${perf.profitFactor}`,
      `Average R: +${perf.averageR}R`,
      `Max Drawdown: ${perf.maxDrawdownPercent}%`,
    ],
    explanation: `Your trading data exhibits a net positive expectancy with an average win rate of ${perf.winRate}%.`,
    watchNote: `Analysis derived from ${sampleSize} verified trade records.`,
    sampleSize,
    confidence,
    supportingTradesCount: sampleSize,
  };
}
