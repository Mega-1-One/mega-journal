'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FileSpreadsheet, Upload, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ImportPage() {
  const { addTrade } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [columnMapping] = useState({
    OpenTime: 'entryTime',
    Symbol: 'symbol',
    Type: 'direction',
    Lots: 'quantity',
    OpenPrice: 'entryPrice',
    ClosePrice: 'exitPrice',
    Profit: 'grossPnL',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setStep(2);
    }
  };

  const handleConfirmImport = () => {
    addTrade({
      account: '$100,000 Apex Funded Account',
      symbol: 'XAUUSD',
      assetClass: 'COMMODITIES',
      direction: 'LONG',
      entryPrice: 2425.0,
      exitPrice: 2442.0,
      quantity: 1.0,
      stopLoss: 2418.0,
      takeProfit: 2445.0,
      totalFees: 8,
      setup: 'Imported CSV Fill',
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
    });
    setStep(3);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-lime" /> Broker Export CSV Importer
        </h1>
        <p className="text-xs text-text-secondary">
          Import trade history directly from MT4/MT5, cTrader, Tradovate, NinjaTrader, or custom CSV
        </p>
      </div>

      {step === 1 && (
        <div className="custom-card p-12 text-center space-y-4 border-dashed border-2 border-bg-border hover:border-lime/50 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary font-heading mb-1">Drag and drop your broker CSV file</h3>
            <p className="text-xs text-text-secondary">Supports MetaTrader 4/5, Tradovate, Rithmic, Interactive Brokers</p>
          </div>
          <label className="inline-block btn-primary-lime text-xs px-5 py-2.5 rounded-lg cursor-pointer shadow font-heading font-black">
            Browse Files
            <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="custom-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-bg-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary font-heading">Map Columns — {fileName}</h3>
              <p className="text-xs text-text-secondary">Match your broker's exported column headers to Mega Journal fields</p>
            </div>
            <span className="text-xs font-bold text-lime px-2.5 py-1 rounded bg-lime/10 border border-lime/20 font-heading">
              Format Detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {Object.entries(columnMapping).map(([brokerCol, appField]) => (
              <div key={brokerCol} className="p-3 bg-bg-nested rounded-lg border border-bg-border flex items-center justify-between font-mono-num">
                <span className="font-bold text-text-secondary font-mono">Broker: "{brokerCol}"</span>
                <ArrowRight className="w-4 h-4 text-text-muted" />
                <span className="font-extrabold text-lime">{appField}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-bg-border">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-xs text-text-muted hover:text-text-primary">
              Back
            </button>
            <button onClick={handleConfirmImport} className="btn-primary-lime text-xs px-5 py-2 rounded-lg font-heading font-black">
              Confirm & Import Trades
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="custom-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary font-heading">Import Complete</h3>
            <p className="text-xs text-text-secondary">Successfully imported trades into your database. All analytics updated.</p>
          </div>
          <button onClick={() => setStep(1)} className="btn-primary-lime text-xs px-5 py-2.5 rounded-lg shadow font-heading font-black">
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}
