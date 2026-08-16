import { TradeCalculated, calculateTradeMetrics } from './calculations';

export interface CandleData {
  id?: string;
  symbol: string;
  timeframe: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestTradeData {
  id: string;
  sessionId: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  entryTime: string;
  exitTime: string;
  grossPnL: number;
  fees: number;
  netPnL: number;
  rMultiple: number;
  isWin: boolean;
  isLoss: boolean;
  mistake?: string;
  emotion?: string;
  notes?: string;
  rulesFollowedCount?: number;
  rulesTotalCount?: number;
}

export interface BacktestSessionData {
  id: string;
  name: string;
  strategyId?: string;
  playbookId?: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  startingBalance: number;
  currentBalance: number;
  riskModel: 'FIXED_LOT' | 'PERCENTAGE';
  riskPercentPerTrade: number;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  notes?: string;
  trades: BacktestTradeData[];
}

/**
 * Built-in default historical candle dataset for XAUUSD 15m
 */
export const DEFAULT_HISTORICAL_CANDLES: CandleData[] = [
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 08:00', open: 2410.50, high: 2414.20, low: 2409.80, close: 2413.50, volume: 1250 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 08:15', open: 2413.50, high: 2418.00, low: 2412.90, close: 2417.40, volume: 1480 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 08:30', open: 2417.40, high: 2422.50, low: 2416.00, close: 2421.80, volume: 2100 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 08:45', open: 2421.80, high: 2425.00, low: 2419.50, close: 2420.10, volume: 1850 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 09:00', open: 2420.10, high: 2428.40, low: 2418.90, close: 2427.60, volume: 3200 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 09:15', open: 2427.60, high: 2432.00, low: 2426.50, close: 2431.10, volume: 2900 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 09:30', open: 2431.10, high: 2435.50, low: 2429.00, close: 2434.20, volume: 3500 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 09:45', open: 2434.20, high: 2438.00, low: 2432.10, close: 2437.50, volume: 2800 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 10:00', open: 2437.50, high: 2442.00, low: 2436.00, close: 2440.80, volume: 4100 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 10:15', open: 2440.80, high: 2441.50, low: 2435.00, close: 2436.20, volume: 2200 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 10:30', open: 2436.20, high: 2439.00, low: 2432.50, close: 2433.80, volume: 1900 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 10:45', open: 2433.80, high: 2435.00, low: 2428.00, close: 2429.40, volume: 2400 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 11:00', open: 2429.40, high: 2432.10, low: 2425.50, close: 2426.90, volume: 2050 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 11:15', open: 2426.90, high: 2431.00, low: 2424.00, close: 2430.20, volume: 1750 },
  { symbol: 'XAUUSD', timeframe: '15m', timestamp: '2026-08-01 11:30', open: 2430.20, high: 2434.50, low: 2429.00, close: 2433.90, volume: 1600 },
];

/**
 * Validates and parses imported CSV historical candle text
 */
export function parseCandleCSV(csvText: string, symbol: string = 'XAUUSD'): { candles: CandleData[]; errors: string[] } {
  const lines = csvText.trim().split('\n');
  const candles: CandleData[] = [];
  const errors: string[] = [];

  if (lines.length < 2) {
    return { candles: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const header = lines[0].toLowerCase();
  if (!header.includes('open') || !header.includes('high') || !header.includes('low') || !header.includes('close')) {
    return { candles: [], errors: ['CSV header must contain Open, High, Low, Close columns.'] };
  }

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim().split(',');
    if (row.length < 5) continue;

    const timestamp = row[0].trim();
    const open = parseFloat(row[1]);
    const high = parseFloat(row[2]);
    const low = parseFloat(row[3]);
    const close = parseFloat(row[4]);
    const volume = row[5] ? parseFloat(row[5]) : 1000;

    if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
      errors.push(`Row ${i + 1}: Invalid numeric OHLC values.`);
      continue;
    }

    if (high < low || open > high || open < low || close > high || close < low) {
      errors.push(`Row ${i + 1}: Invalid candle boundaries (High must be >= Low, Open/Close within High/Low).`);
      continue;
    }

    candles.push({
      symbol,
      timeframe: '15m',
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return { candles, errors };
}

/**
 * Evaluates trade execution against subsequent historical candles
 */
export function evaluateCandleExecution(
  direction: 'LONG' | 'SHORT',
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  quantity: number,
  currentCandle: CandleData,
  assetClass: string = 'COMMODITIES'
): { isClosed: boolean; exitPrice: number; reason: 'TP' | 'SL' | 'MANUAL'; netPnL: number; rMultiple: number } {
  let isClosed = false;
  let exitPrice = currentCandle.close;
  let reason: 'TP' | 'SL' | 'MANUAL' = 'MANUAL';

  if (direction === 'LONG') {
    if (currentCandle.low <= stopLoss) {
      isClosed = true;
      exitPrice = stopLoss;
      reason = 'SL';
    } else if (currentCandle.high >= takeProfit) {
      isClosed = true;
      exitPrice = takeProfit;
      reason = 'TP';
    }
  } else {
    if (currentCandle.high >= stopLoss) {
      isClosed = true;
      exitPrice = stopLoss;
      reason = 'SL';
    } else if (currentCandle.low <= takeProfit) {
      isClosed = true;
      exitPrice = takeProfit;
      reason = 'TP';
    }
  }

  const tradeCalc = calculateTradeMetrics({
    direction,
    entryPrice,
    exitPrice,
    quantity,
    stopLoss,
    takeProfit,
    assetClass: assetClass as any,
  });

  return {
    isClosed,
    exitPrice,
    reason,
    netPnL: tradeCalc.netPnL,
    rMultiple: tradeCalc.rMultiple,
  };
}
