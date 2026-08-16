'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, History, ArrowRight, Wallet } from 'lucide-react';
import { autoDetectColumnMapping, validateImportCSV, ColumnMapping, ImportValidationResult } from '@/lib/importEngine';

export default function TradeImportPage() {
  const { accounts, activeAccountData, trades, addTrade } = useApp();
  const [csvText, setCsvText] = useState('');
  const [selectedAccountName, setSelectedAccountName] = useState(activeAccountData?.name || accounts[0]?.name);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: 'Date',
    symbol: 'Symbol',
    direction: 'Type',
    entryPrice: 'Entry',
    exitPrice: 'Exit',
    quantity: 'Quantity',
  });

  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isImported, setIsImported] = useState(false);

  const handleDetect = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length > 0) {
      const header = lines[0].split(',').map((h) => h.trim());
      const detected = autoDetectColumnMapping(header);
      setMapping(detected);
    }
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const res = validateImportCSV(csvText, mapping, selectedAccountName, trades);
    setValidationResult(res);
  };

  const handleExecuteImport = () => {
    if (!validationResult) return;

    validationResult.rows.forEach((row) => {
      if (row.isValid && !row.isDuplicate && row.trade) {
        addTrade(row.trade);
      }
    });

    setIsImported(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-lime" /> Broker Trade CSV Importer
          </h1>
          <p className="text-xs text-text-secondary">
            Import MT4, MT5, TradingView, or broker CSV statements with smart mapping and duplicate protection.
          </p>
        </div>

        <Link href="/import/history" className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-heading font-bold">
          <History className="w-4 h-4 text-lime" />
          <span>Import History & Rollback</span>
        </Link>
      </div>

      {/* STEP 1: PASTE CSV & ACCOUNT SELECTOR */}
      <form onSubmit={handleValidate} className="custom-card p-6 space-y-4 text-xs font-mono-num">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-text-secondary font-bold block mb-1">Target Account</label>
            <select
              value={selectedAccountName}
              onChange={(e) => setSelectedAccountName(e.target.value)}
              className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({a.broker})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleDetect}
              className="btn-secondary text-xs px-4 py-2 rounded-xl font-heading font-bold w-full"
            >
              Auto-Detect Columns from CSV Header
            </button>
          </div>
        </div>

        <div>
          <label className="text-text-secondary font-bold block mb-1">Paste Broker CSV Text</label>
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Date,Symbol,Type,Entry,Exit,Quantity\n2026-08-01 08:00,XAUUSD,BUY,2410.5,2435.0,1.0\n2026-08-01 10:00,NAS100,SELL,19850,19780,2.0`}
            className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
        >
          <Upload className="w-4 h-4" /> Validate Import Data
        </button>
      </form>

      {/* STEP 2: VALIDATION PREVIEW SUMMARY */}
      {validationResult && (
        <div className="custom-card p-6 space-y-4 font-mono-num">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">
              Import Validation Preview ({validationResult.totalRows} Rows Evaluated)
            </h3>

            {!isImported ? (
              <button
                onClick={handleExecuteImport}
                className="btn-primary-lime text-xs px-5 py-2 rounded-xl shadow-glow font-heading font-black"
              >
                Confirm Import ({validationResult.validRowsCount} Trades)
              </button>
            ) : (
              <span className="text-xs font-bold text-lime flex items-center gap-1 font-heading">
                <CheckCircle2 className="w-4 h-4" /> Import Complete!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Total Rows</span>
              <span className="text-sm font-bold text-text-primary">{validationResult.totalRows}</span>
            </div>
            <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Valid Rows</span>
              <span className="text-sm font-bold text-lime">{validationResult.validRowsCount}</span>
            </div>
            <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Duplicates Detected</span>
              <span className="text-sm font-bold text-warning">{validationResult.duplicateRowsCount}</span>
            </div>
            <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
              <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Invalid Rows</span>
              <span className="text-sm font-bold text-loss">{validationResult.invalidRowsCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
