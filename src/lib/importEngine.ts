import { TradeInput, calculateTradeMetrics } from './calculations';

export interface ColumnMapping {
  date: string;
  symbol: string;
  direction: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  stopLoss?: string;
  takeProfit?: string;
  fees?: string;
  account?: string;
  notes?: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  isValid: boolean;
  isDuplicate: boolean;
  error?: string;
  trade?: TradeInput;
}

export interface ImportValidationResult {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateRowsCount: number;
  rows: ImportPreviewRow[];
}

export interface ImportBatchRecord {
  id: string;
  timestamp: string;
  source: string;
  accountName: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  status: 'COMPLETED' | 'ROLLED_BACK';
}

/**
 * Smart Column Mapper Auto-Detector for MT4, MT5, TradingView, and Generic CSVs
 */
export function autoDetectColumnMapping(headerRow: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    date: '',
    symbol: '',
    direction: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
  };

  headerRow.forEach((col) => {
    const c = col.toLowerCase().trim();
    if (!mapping.date && (c.includes('date') || c.includes('time') || c.includes('open time'))) mapping.date = col;
    if (!mapping.symbol && (c.includes('symbol') || c.includes('pair') || c.includes('ticker') || c.includes('instrument'))) mapping.symbol = col;
    if (!mapping.direction && (c.includes('direction') || c.includes('type') || c.includes('side') || c.includes('action'))) mapping.direction = col;
    if (!mapping.entryPrice && (c.includes('entry') || c.includes('open price') || c.includes('buy price'))) mapping.entryPrice = col;
    if (!mapping.exitPrice && (c.includes('exit') || c.includes('close price') || c.includes('sell price'))) mapping.exitPrice = col;
    if (!mapping.quantity && (c.includes('quantity') || c.includes('volume') || c.includes('lots') || c.includes('size') || c.includes('qty'))) mapping.quantity = col;
    if (!mapping.stopLoss && (c.includes('stop loss') || c.includes('sl'))) mapping.stopLoss = col;
    if (!mapping.takeProfit && (c.includes('take profit') || c.includes('tp'))) mapping.takeProfit = col;
    if (!mapping.fees && (c.includes('fee') || c.includes('commission') || c.includes('swap'))) mapping.fees = col;
  });

  return mapping;
}

/**
 * Validates and previews broker CSV imports
 */
export function validateImportCSV(
  csvText: string,
  mapping: ColumnMapping,
  accountName: string,
  existingTrades: any[]
): ImportValidationResult {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    return { totalRows: 0, validRowsCount: 0, invalidRowsCount: 0, duplicateRowsCount: 0, rows: [] };
  }

  const header = lines[0].split(',').map((h) => h.trim());
  const rows: ImportPreviewRow[] = [];

  let validCount = 0;
  let invalidCount = 0;
  let dupCount = 0;

  const dateIdx = header.indexOf(mapping.date);
  const symbolIdx = header.indexOf(mapping.symbol);
  const dirIdx = header.indexOf(mapping.direction);
  const entryIdx = header.indexOf(mapping.entryPrice);
  const exitIdx = header.indexOf(mapping.exitPrice);
  const qtyIdx = header.indexOf(mapping.quantity);

  for (let i = 1; i < lines.length; i++) {
    const colValues = lines[i].split(',').map((v) => v.trim());
    if (colValues.length < 4) continue;

    const dateVal = dateIdx !== -1 ? colValues[dateIdx] : new Date().toISOString();
    const symbolVal = symbolIdx !== -1 ? colValues[symbolIdx].toUpperCase() : 'XAUUSD';
    const rawDir = dirIdx !== -1 ? colValues[dirIdx].toUpperCase() : 'BUY';
    const direction = rawDir.includes('SELL') || rawDir.includes('SHORT') ? 'SHORT' : 'LONG';
    const entryPrice = entryIdx !== -1 ? parseFloat(colValues[entryIdx]) : 0;
    const exitPrice = exitIdx !== -1 ? parseFloat(colValues[exitIdx]) : 0;
    const qty = qtyIdx !== -1 ? parseFloat(colValues[qtyIdx]) : 1.0;

    let isValid = true;
    let errorMsg = '';

    if (isNaN(entryPrice) || isNaN(exitPrice) || entryPrice <= 0 || exitPrice <= 0) {
      isValid = false;
      errorMsg = 'Invalid entry/exit prices.';
    }

    // Duplicate Check based on symbol + direction + entryPrice + quantity
    const isDuplicate = existingTrades.some(
      (t) =>
        t.symbol === symbolVal &&
        t.direction === direction &&
        Math.abs(t.entryPrice - entryPrice) < 0.01 &&
        Math.abs(t.quantity - qty) < 0.01
    );

    if (isDuplicate) dupCount++;
    if (!isValid) invalidCount++;
    if (isValid && !isDuplicate) validCount++;

    const tradeInput: TradeInput = {
      account: accountName,
      symbol: symbolVal,
      assetClass: 'COMMODITIES',
      direction,
      entryPrice,
      exitPrice,
      quantity: qty,
      entryTime: new Date(dateVal).toISOString(),
      exitTime: new Date().toISOString(),
      status: 'ACTIVE',
    };

    rows.push({
      rowNumber: i,
      isValid,
      isDuplicate,
      error: errorMsg,
      trade: tradeInput,
    });
  }

  return {
    totalRows: rows.length,
    validRowsCount: validCount,
    invalidRowsCount: invalidCount,
    duplicateRowsCount: dupCount,
    rows,
  };
}
