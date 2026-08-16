// Central Persistent Store and Mock Seed Generator for Mega Journal
import { calculateTradeMetrics, calculateAnalyticsSummary, TradeCalculated, AnalyticsSummary } from './calculations';

export interface AccountData {
  id: string;
  name: string;
  broker: string;
  accountType: 'PERSONAL' | 'FUNDED' | 'EVALUATION' | 'DEMO' | 'BACKTEST';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  status: string;
}

export interface PropFirmData {
  id: string;
  firmName: string;
  accountSize: number;
  challengePhase: 'PHASE_1' | 'PHASE_2' | 'FUNDED';
  startingBalance: number;
  currentBalance: number;
  profitTarget: number;
  dailyLossLimit: number;
  maximumLossLimit: number;
  payoutTarget: number;
  status: 'ACTIVE' | 'PASSED' | 'BREACHED';
  dailyRiskUsed: number;
  currentDrawdown: number;
}

export interface StrategyData {
  id: string;
  name: string;
  description: string;
  market: string;
  timeframe: string;
  session: string;
  rules: string[];
}

export interface JournalData {
  id: string;
  date: string;
  preMarketPlan: string;
  duringSession: string;
  endOfDayReview: string;
  whatWentWell: string;
  whatWentWrong: string;
  biggestLesson: string;
  emotionalState: string;
  ruleAdherence: number;
}

export interface PsychologyData {
  id: string;
  date: string;
  emotion: string;
  confidence: number;
  stressLevel: number;
  focusScore: number;
  notes: string;
}

export interface TradingRuleData {
  id: string;
  ruleText: string;
  category: 'RISK' | 'DISCIPLINE' | 'EXECUTION' | 'ROUTINE';
  streak: number;
}

// Global Demo Accounts
export const DEMO_ACCOUNTS: AccountData[] = [
  {
    id: 'acc-1',
    name: '$100,000 Apex Funded Account',
    broker: 'PropFirmDirect / MetaTrader 5',
    accountType: 'FUNDED',
    startingBalance: 100000,
    currentBalance: 108450,
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'acc-2',
    name: '$10,000 FTMO Challenge Phase 1',
    broker: 'FTMO MT4',
    accountType: 'EVALUATION',
    startingBalance: 10000,
    currentBalance: 10427,
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'acc-3',
    name: '$1,000 Personal Forex Account',
    broker: 'OANDA v20',
    accountType: 'PERSONAL',
    startingBalance: 1000,
    currentBalance: 1145,
    currency: 'USD',
    status: 'ACTIVE',
  },
];

// Global Prop Firm Status
export const DEMO_PROP_FIRMS: PropFirmData[] = [
  {
    id: 'prop-1',
    firmName: 'FTMO Challenge',
    accountSize: 10000,
    challengePhase: 'PHASE_1',
    startingBalance: 10000,
    currentBalance: 10427,
    profitTarget: 1000,
    dailyLossLimit: 500,
    maximumLossLimit: 1000,
    payoutTarget: 11000,
    status: 'ACTIVE',
    dailyRiskUsed: 145,
    currentDrawdown: 73,
  },
  {
    id: 'prop-2',
    firmName: 'FundingPips Funded',
    accountSize: 100000,
    challengePhase: 'FUNDED',
    startingBalance: 100000,
    currentBalance: 108450,
    profitTarget: 0,
    dailyLossLimit: 5000,
    maximumLossLimit: 10000,
    payoutTarget: 110000,
    status: 'ACTIVE',
    dailyRiskUsed: 1200,
    currentDrawdown: 1850,
  },
];

// Strategies
export const DEMO_STRATEGIES: StrategyData[] = [
  {
    id: 'strat-1',
    name: 'ICT London Killzone FVG',
    description: 'Trading London session liquidity sweeps into 15m Fair Value Gaps with 5m MSS confirmation.',
    market: 'Forex & Indices',
    timeframe: '15m / 5m',
    session: 'London (02:00 - 05:00 EST)',
    rules: [
      'Asian range liquidity swept',
      'Market Structure Shift on 5m timeframe',
      'Displacement leaving Fair Value Gap',
      'Entry limit order at 50% FVG retrace',
      'Stop loss beyond swing high/low',
      'Risk capped at 1% per trade',
    ],
  },
  {
    id: 'strat-2',
    name: 'New York Open Break of Structure',
    description: 'Capturing NY equities open continuation off 1h Order Blocks.',
    market: 'NAS100 / US30',
    timeframe: '1h / 15m',
    session: 'New York (09:30 - 11:30 EST)',
    rules: [
      '1h trend bias confirmed',
      'NY 09:30 open volatility sweep',
      'Retest of key 1h Order Block',
      'Target 1:3 Risk/Reward minimum',
    ],
  },
  {
    id: 'strat-3',
    name: 'Gold Liquidity Sweep Retest',
    description: 'High volatility XAUUSD sweeps during overlap sessions.',
    market: 'Commodities (XAUUSD)',
    timeframe: '15m / 1m',
    session: 'London / NY Overlap',
    rules: [
      'Equal highs/lows pool cleared',
      'V-shape reversal candle pattern',
      'Risk < $150 per lot',
    ],
  },
];

// Pre-seeded Trade Log
export const RAW_TRADES = [
  {
    id: 'trd-101',
    account: '$100,000 Apex Funded Account',
    symbol: 'NAS100',
    assetClass: 'INDICES',
    direction: 'LONG',
    entryPrice: 19820,
    exitPrice: 19950,
    quantity: 2,
    stopLoss: 19770,
    takeProfit: 19970,
    entryTime: '2026-08-15T14:30:00Z',
    exitTime: '2026-08-15T15:45:00Z',
    commission: 12,
    fees: 4,
    strategyId: 'strat-2',
    setup: 'Order Block Retest',
    tags: ['NY Open', 'Clean Break', 'High Confidence'],
    mistake: 'None',
    emotion: 'Calm',
    rating: 5,
    notes: 'Excellently executed NY open continuation off 1h order block.',
  },
  {
    id: 'trd-102',
    account: '$100,000 Apex Funded Account',
    symbol: 'XAUUSD',
    assetClass: 'COMMODITIES',
    direction: 'SHORT',
    entryPrice: 2435.5,
    exitPrice: 2418.0,
    quantity: 1.5,
    stopLoss: 2441.0,
    takeProfit: 2415.0,
    entryTime: '2026-08-15T08:15:00Z',
    exitTime: '2026-08-15T10:00:00Z',
    commission: 15,
    fees: 5,
    strategyId: 'strat-3',
    setup: 'Liquidity Sweep',
    tags: ['London Killzone', 'FVG'],
    mistake: 'None',
    emotion: 'Confident',
    rating: 5,
    notes: 'Swept Asian high at 2435 and crashed into 1h discount array.',
  },
  {
    id: 'trd-103',
    account: '$100,000 Apex Funded Account',
    symbol: 'EURUSD',
    assetClass: 'FOREX',
    direction: 'LONG',
    entryPrice: 1.092,
    exitPrice: 1.0895,
    quantity: 3,
    stopLoss: 1.0895,
    takeProfit: 1.097,
    entryTime: '2026-08-14T07:00:00Z',
    exitTime: '2026-08-14T08:30:00Z',
    commission: 18,
    fees: 2,
    strategyId: 'strat-1',
    setup: 'FVG Retest',
    tags: ['London', 'Loss'],
    mistake: 'FOMO Entry',
    emotion: 'Frustrated',
    rating: 2,
    notes: 'Entered before 5m MSS confirmation. Stopped out cleanly.',
  },
  {
    id: 'trd-104',
    account: '$10,000 FTMO Challenge Phase 1',
    symbol: 'BTCUSD',
    assetClass: 'CRYPTO',
    direction: 'LONG',
    entryPrice: 58500,
    exitPrice: 60200,
    quantity: 0.2,
    stopLoss: 57900,
    takeProfit: 60500,
    entryTime: '2026-08-13T18:00:00Z',
    exitTime: '2026-08-14T02:00:00Z',
    commission: 8,
    fees: 2,
    strategyId: 'strat-1',
    setup: 'Liquidity Sweep',
    tags: ['Swing', 'BOS'],
    mistake: 'None',
    emotion: 'Calm',
    rating: 5,
    notes: '4h higher low bounce into liquidity target above 60k.',
  },
  {
    id: 'trd-105',
    account: '$100,000 Apex Funded Account',
    symbol: 'GBPUSD',
    assetClass: 'FOREX',
    direction: 'SHORT',
    entryPrice: 1.284,
    exitPrice: 1.278,
    quantity: 2.5,
    stopLoss: 1.2865,
    takeProfit: 1.277,
    entryTime: '2026-08-12T09:00:00Z',
    exitTime: '2026-08-12T11:45:00Z',
    commission: 15,
    fees: 3,
    strategyId: 'strat-1',
    setup: 'MSS',
    tags: ['NY Session', 'Clean RR'],
    mistake: 'None',
    emotion: 'Confident',
    rating: 5,
    notes: 'Rejection off daily order block with high volume displacement.',
  },
  {
    id: 'trd-106',
    account: '$1,000 Personal Forex Account',
    symbol: 'XAUUSD',
    assetClass: 'COMMODITIES',
    direction: 'LONG',
    entryPrice: 2410.0,
    exitPrice: 2428.0,
    quantity: 0.1,
    stopLoss: 2404.0,
    takeProfit: 2430.0,
    entryTime: '2026-08-11T13:00:00Z',
    exitTime: '2026-08-11T15:20:00Z',
    commission: 2,
    fees: 1,
    strategyId: 'strat-3',
    setup: 'Liquidity Sweep',
    tags: ['Personal', 'Win'],
    mistake: 'None',
    emotion: 'Calm',
    rating: 4,
    notes: 'Scaled in on 15m bullish engulfing candle.',
  },
];

// Initialize calculated demo trades
export function getInitialCalculatedTrades(): TradeCalculated[] {
  return RAW_TRADES.map((t) => calculateTradeMetrics(t as any));
}

// Rules for Discipline Tracker
export const DEMO_TRADING_RULES: TradingRuleData[] = [
  { id: 'r-1', ruleText: 'Never risk more than 1% of total balance per trade', category: 'RISK', streak: 14 },
  { id: 'r-2', ruleText: 'Wait for 5m Market Structure Shift confirmation before entry', category: 'EXECUTION', streak: 9 },
  { id: 'r-3', ruleText: 'Stop trading after 2 consecutive daily losses (Max Daily Risk)', category: 'RISK', streak: 21 },
  { id: 'r-4', ruleText: 'Complete Pre-Market Plan before taking any position', category: 'ROUTINE', streak: 12 },
  { id: 'r-5', ruleText: 'Do not move Stop Loss once trade is executed', category: 'DISCIPLINE', streak: 18 },
];
