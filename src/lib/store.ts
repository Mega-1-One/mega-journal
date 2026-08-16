// Central Seed Store for MEGA1 — The Trading Performance Operating System
import { calculateTradeMetrics, TradeCalculated } from './calculations';

export interface AccountData {
  id: string;
  name: string;
  broker: string;
  accountType: 'PERSONAL' | 'FUNDED' | 'EVALUATION' | 'DEMO';
  startingBalance: number;
  currentBalance: number;
  currency: string;
  status: string;
  notes?: string;
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

export interface TradingRule {
  id: string;
  ruleText: string;
  category: string;
  streak: number;
}

export const DEMO_ACCOUNTS: AccountData[] = [
  {
    id: 'acc-mega1-prop',
    name: 'MEGA1 $10K Prop Account',
    broker: 'FTMO MT4 / Rithmic',
    accountType: 'EVALUATION',
    startingBalance: 10000,
    currentBalance: 10840,
    currency: 'USD',
    status: 'ACTIVE',
    notes: 'Evaluation challenge account for prop funding',
  },
  {
    id: 'acc-mega1-forex',
    name: 'MEGA1 Forex Personal',
    broker: 'OANDA v20 API',
    accountType: 'PERSONAL',
    startingBalance: 1000,
    currentBalance: 1145,
    currency: 'USD',
    status: 'ACTIVE',
  },
  {
    id: 'acc-mega1-demo',
    name: 'MEGA1 Demo Account',
    broker: 'MetaTrader 5 Demo',
    accountType: 'DEMO',
    startingBalance: 50000,
    currentBalance: 51200,
    currency: 'USD',
    status: 'ACTIVE',
  },
];

export const DEMO_PROP_FIRMS: PropFirmData[] = [
  {
    id: 'prop-mega1-1',
    firmName: 'MEGA1 Prop Challenge',
    accountSize: 10000,
    challengePhase: 'PHASE_1',
    startingBalance: 10000,
    currentBalance: 10840,
    profitTarget: 1000,
    dailyLossLimit: 500,
    maximumLossLimit: 1000,
    payoutTarget: 11000,
    status: 'ACTIVE',
    dailyRiskUsed: 120,
    currentDrawdown: 180,
  },
];

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
];

export const DEMO_TRADING_RULES: TradingRule[] = [
  { id: 'rule-1', ruleText: 'Never risk more than 1% per trade', category: 'Risk Management', streak: 12 },
  { id: 'rule-2', ruleText: 'Must have 5m Market Structure Shift confirmation before entry', category: 'Execution', streak: 8 },
  { id: 'rule-3', ruleText: 'No trading during high-impact news releases (NFP, CPI)', category: 'Discipline', streak: 15 },
  { id: 'rule-4', ruleText: 'Stop trading for the day after 2 consecutive losses', category: 'Psychology', streak: 5 },
];

export const RAW_TRADES = [
  {
    id: 'trd-mega1-101',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'NAS100',
    assetClass: 'INDICES',
    direction: 'LONG',
    entryPrice: 19820,
    exitPrice: 19950,
    quantity: 1,
    stopLoss: 19770,
    takeProfit: 19970,
    entryTime: '2026-08-15T14:30:00Z',
    exitTime: '2026-08-15T15:45:00Z',
    totalFees: 10,
    strategyId: 'strat-2',
    setup: 'Order Block Retest',
    session: 'NEW_YORK',
    tags: ['NY Open', 'Clean Break'],
    mistake: 'None',
    emotion: 'Calm',
    confidence: 9,
    rating: 5,
    notes: 'Excellently executed NY open continuation off 1h order block.',
  },
  {
    id: 'trd-mega1-102',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'XAUUSD',
    assetClass: 'COMMODITIES',
    direction: 'SHORT',
    entryPrice: 2435.5,
    exitPrice: 2418.0,
    quantity: 1.0,
    stopLoss: 2441.0,
    takeProfit: 2415.0,
    entryTime: '2026-08-15T08:15:00Z',
    exitTime: '2026-08-15T10:00:00Z',
    totalFees: 12,
    strategyId: 'strat-1',
    setup: 'Liquidity Sweep',
    session: 'LONDON',
    tags: ['London Killzone', 'FVG'],
    mistake: 'None',
    emotion: 'Confident',
    confidence: 8,
    rating: 5,
    notes: 'Swept Asian high at 2435 and crashed into 1h discount array.',
  },
  {
    id: 'trd-mega1-103',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'EURUSD',
    assetClass: 'FOREX',
    direction: 'LONG',
    entryPrice: 1.092,
    exitPrice: 1.0895,
    quantity: 2,
    stopLoss: 1.0895,
    takeProfit: 1.097,
    entryTime: '2026-08-14T07:00:00Z',
    exitTime: '2026-08-14T08:30:00Z',
    totalFees: 8,
    strategyId: 'strat-1',
    setup: 'FVG Retest',
    session: 'LONDON',
    tags: ['London', 'Loss'],
    mistake: 'FOMO Entry',
    emotion: 'Frustrated',
    confidence: 5,
    rating: 2,
    notes: 'Entered before 5m MSS confirmation. Stopped out cleanly.',
  },
  {
    id: 'trd-mega1-104',
    account: 'MEGA1 $10K Prop Account',
    symbol: 'GBPUSD',
    assetClass: 'FOREX',
    direction: 'SHORT',
    entryPrice: 1.284,
    exitPrice: 1.278,
    quantity: 2,
    stopLoss: 1.2865,
    takeProfit: 1.277,
    entryTime: '2026-08-12T09:00:00Z',
    exitTime: '2026-08-12T11:45:00Z',
    totalFees: 10,
    strategyId: 'strat-1',
    setup: 'MSS',
    session: 'NEW_YORK',
    tags: ['NY Session', 'Clean RR'],
    mistake: 'None',
    emotion: 'Confident',
    confidence: 9,
    rating: 5,
    notes: 'Rejection off daily order block with high volume displacement.',
  },
];

export function getInitialCalculatedTrades(): TradeCalculated[] {
  return RAW_TRADES.map((t) => calculateTradeMetrics(t as any));
}
