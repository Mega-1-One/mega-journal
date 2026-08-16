import { TradeInput, calculateTradeMetrics, TradeCalculated } from './calculations';

export interface AccountData {
  id: string;
  name: string;
  broker: string;
  accountType: 'PERSONAL' | 'FUNDED' | 'EVALUATION' | 'DEMO';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface PropFirmData {
  id: string;
  accountName: string;
  firmName: string;
  step: 'CHALLENGE' | 'VERIFICATION' | 'FUNDED';
  challengePhase: string;
  startingBalance: number;
  initialBalance: number;
  currentBalance: number;
  profitTarget: number;
  payoutTarget: number;
  maxDailyLossLimit: number;
  maxTotalLossLimit: number;
  dailyLossLimit: number;
  maximumLossLimit: number;
  dailyRiskUsed: number;
  currentDrawdown: number;
  todayLoss: number;
  totalLoss: number;
  daysRemaining: number;
  status: 'PASSING' | 'WARNING' | 'FAILED';
}

export interface RuleData {
  id: string;
  strategyId?: string;
  playbookId?: string;
  ruleName: string;
  ruleText?: string;
  category: 'PRE_TRADE' | 'SETUP' | 'ENTRY' | 'RISK' | 'MANAGEMENT' | 'EXIT' | 'POST_TRADE' | 'PSYCHOLOGY';
  isRequired: boolean;
  priority: number;
  streak?: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface PlaybookData {
  id: string;
  strategyId: string;
  name: string;
  description: string;
  market: string;
  symbols: string;
  sessions: string;
  timeframes: string;
  entryModel: string;
  stopModel: string;
  targetModel: string;
  minRiskReward: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  rules: RuleData[];
}

export interface StrategyData {
  id: string;
  name: string;
  description: string;
  market: string;
  timeframe: string;
  session: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  winRate: number;
  totalTrades: number;
  netPnL: number;
  rules?: RuleData[];
}

export interface ChecklistResult {
  tradeId: string;
  ruleId: string;
  ruleName: string;
  category: string;
  isFollowed: boolean;
}

export const DEMO_ACCOUNTS: AccountData[] = [
  {
    id: 'acc-1',
    name: 'MEGA1 $10K Prop Account',
    broker: 'FTMO / MetaTrader 5',
    accountType: 'FUNDED',
    startingBalance: 10000,
    currentBalance: 11850,
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'acc-2',
    name: 'Apex $50K Futures Account',
    broker: 'Tradovate / NinjaTrader',
    accountType: 'EVALUATION',
    startingBalance: 50000,
    currentBalance: 53200,
    currency: 'USD',
    status: 'ACTIVE',
  },
];

export const DEMO_PROP_FIRMS: PropFirmData[] = [
  {
    id: 'pf-1',
    accountName: 'MEGA1 $10K Prop Account',
    firmName: 'FTMO',
    step: 'FUNDED',
    challengePhase: 'Phase 1 Funded',
    startingBalance: 10000,
    initialBalance: 10000,
    currentBalance: 11850,
    profitTarget: 1000,
    payoutTarget: 12000,
    maxDailyLossLimit: 500,
    maxTotalLossLimit: 1000,
    dailyLossLimit: 500,
    maximumLossLimit: 1000,
    dailyRiskUsed: 120,
    currentDrawdown: 120,
    todayLoss: 120,
    totalLoss: 0,
    daysRemaining: 30,
    status: 'PASSING',
  },
];

export const DEMO_RULES: RuleData[] = [
  {
    id: 'rule-1',
    strategyId: 'strat-1',
    ruleName: 'HTF 15m/1h Liquidity Sweep Confirmed',
    ruleText: 'HTF 15m/1h Liquidity Sweep Confirmed',
    category: 'PRE_TRADE',
    isRequired: true,
    priority: 1,
    streak: 12,
    status: 'ACTIVE',
  },
  {
    id: 'rule-2',
    strategyId: 'strat-1',
    ruleName: '5m Market Structure Shift with Displacement',
    ruleText: '5m Market Structure Shift with Displacement',
    category: 'ENTRY',
    isRequired: true,
    priority: 2,
    streak: 9,
    status: 'ACTIVE',
  },
  {
    id: 'rule-3',
    strategyId: 'strat-1',
    ruleName: '50% FVG Retracement Entry',
    ruleText: '50% FVG Retracement Entry',
    category: 'ENTRY',
    isRequired: true,
    priority: 3,
    streak: 14,
    status: 'ACTIVE',
  },
  {
    id: 'rule-4',
    strategyId: 'strat-1',
    ruleName: 'Risk Capped at Maximum 1% per Position',
    ruleText: 'Risk Capped at Maximum 1% per Position',
    category: 'RISK',
    isRequired: true,
    priority: 4,
    streak: 18,
    status: 'ACTIVE',
  },
  {
    id: 'rule-5',
    strategyId: 'strat-1',
    ruleName: 'Minimum 2.0 Risk-to-Reward Ratio',
    ruleText: 'Minimum 2.0 Risk-to-Reward Ratio',
    category: 'RISK',
    isRequired: true,
    priority: 5,
    streak: 8,
    status: 'ACTIVE',
  },
];

export const DEMO_TRADING_RULES = DEMO_RULES;

export const DEMO_PLAYBOOKS: PlaybookData[] = [
  {
    id: 'pb-1',
    strategyId: 'strat-1',
    name: 'London Liquidity Sweep',
    description: 'Sweeps Asian session highs/lows during London killzone (02:00 - 05:00 EST).',
    market: 'Forex & Gold',
    symbols: 'XAUUSD, EURUSD, GBPUSD',
    sessions: 'LONDON',
    timeframes: '15m / 5m / 1m',
    entryModel: '50% Fair Value Gap retrace after 5m MSS',
    stopModel: '1-2 pips beyond local swing high/low',
    targetModel: 'Opposite session liquidity or 1:3 R/R',
    minRiskReward: 2.5,
    status: 'ACTIVE',
    rules: DEMO_RULES,
  },
  {
    id: 'pb-2',
    strategyId: 'strat-1',
    name: 'NY Open Judas Swing',
    description: 'Fakeout expansion at 09:30 EST NYSE open reversing into true trend direction.',
    market: 'Indices & Futures',
    symbols: 'NAS100, US30, SPX500',
    sessions: 'NEW_YORK',
    timeframes: '15m / 3m',
    entryModel: '3m Market Structure Shift + Order Block',
    stopModel: 'Above Judas swing high',
    targetModel: 'Daily open price or 1:2 R/R',
    minRiskReward: 2.0,
    status: 'ACTIVE',
    rules: DEMO_RULES,
  },
];

export const DEMO_STRATEGIES: StrategyData[] = [
  {
    id: 'strat-1',
    name: 'ICT Concepts (Smart Money)',
    description: 'Liquidity sweeps, Fair Value Gaps, and Market Structure Shifts during high-volume sessions.',
    market: 'Forex, Indices, Commodities',
    timeframe: '15m / 5m',
    session: 'London & NY Overlap',
    status: 'ACTIVE',
    winRate: 75.0,
    totalTrades: 12,
    netPnL: 3850.0,
    rules: DEMO_RULES,
  },
  {
    id: 'strat-2',
    name: 'Asian Range Expansion Breakout',
    description: 'Breakout and retest of Asian session consolidation boundaries during London open.',
    market: 'Forex (EURUSD, GBPUSD)',
    timeframe: '1h / 15m',
    session: 'London',
    status: 'ACTIVE',
    winRate: 60.0,
    totalTrades: 5,
    netPnL: 1200.0,
    rules: DEMO_RULES,
  },
];

export const RAW_DEMO_TRADES: Partial<TradeInput>[] = [
  {
    id: 'trd-101',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'XAUUSD',
    assetClass: 'COMMODITIES',
    direction: 'LONG',
    entryPrice: 2420.0,
    exitPrice: 2438.5,
    quantity: 1.0,
    stopLoss: 2412.0,
    takeProfit: 2440.0,
    entryTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    exitTime: new Date(Date.now() - 1800000).toISOString(),
    totalFees: 9.0,
    strategyId: 'strat-1',
    playbookId: 'pb-1',
    setup: 'Liquidity Sweep',
    session: 'NEW_YORK',
    tags: ['Liquidity Sweep', 'London Killzone'],
    mistake: 'None',
    emotion: 'Calm',
    confidence: 9,
    rating: 5,
    notes: 'Clean 15m FVG retrace entry after Asian high sweep.',
    structuredNotes: {
      whyEntered: 'Swept liquidity into 15m Fair Value Gap.',
      whatSaw: '5m Market Structure Shift with high volume displacement.',
      whatWentWell: 'Waited patiently for 50% FVG retrace entry.',
      whatWentWrong: 'No major execution mistakes.',
      lessonLearned: 'Sticking to pre-market bias yields high expectancy.',
    },
    status: 'ACTIVE',
  },
  {
    id: 'trd-102',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'NAS100',
    assetClass: 'INDICES',
    direction: 'SHORT',
    entryPrice: 19850.0,
    exitPrice: 19780.0,
    quantity: 2.0,
    stopLoss: 19890.0,
    takeProfit: 19750.0,
    entryTime: new Date(Date.now() - 86400000 * 1).toISOString(),
    exitTime: new Date(Date.now() - 86400000 * 1 + 3600000).toISOString(),
    totalFees: 12.0,
    strategyId: 'strat-1',
    playbookId: 'pb-2',
    setup: 'Fair Value Gap',
    session: 'NEW_YORK',
    tags: ['FVG', 'Order Block'],
    mistake: 'None',
    emotion: 'Confident',
    confidence: 8,
    rating: 5,
    notes: 'Rejection from 1h Order Block at NYSE open.',
    status: 'ACTIVE',
  },
];

export function getInitialCalculatedTrades(): TradeCalculated[] {
  return RAW_DEMO_TRADES.map((t) => calculateTradeMetrics(t));
}
