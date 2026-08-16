'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { parseCandleCSV, CandleData } from '@/lib/backtestEngine';

export default function BacktestImportPage() {
  const [csvText, setCsvText] = useState('');
  const [symbol, setSymbol] = useState('XAUUSD');
  const [parsedCandles, setParsedCandles] = useState<CandleData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const res = parseCandleCSV(csvText, symbol);
    setParsedCandles(res.candles);
    setErrors(res.errors);
    if (res.candles.length > 0) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/backtest"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-lime" /> CSV Historical Data Importer
            </h1>
            <p className="text-xs text-text-secondary">Import historical OHLCV candle datasets for backtesting replay.</p>
          </div>
        </div>
      </div>

      {/* CSV Parser Form */}
      <form onSubmit={handleParse} className="custom-card p-6 space-y-4 text-xs font-mono-num">
        <div>
          <label className="text-text-secondary font-bold block mb-1">Target Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-bold"
          />
        </div>

        <div>
          <label className="text-text-secondary font-bold block mb-1">Paste CSV Data (Timestamp, Open, High, Low, Close, Volume)</label>
          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`Timestamp,Open,High,Low,Close,Volume\n2026-08-01 08:00,2410.5,2414.2,2409.8,2413.5,1250\n2026-08-01 08:15,2413.5,2418.0,2412.9,2417.4,1480`}
            className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
        >
          <Upload className="w-4 h-4" /> Validate & Import Candles
        </button>
      </form>

      {/* Success Banner */}
      {isSuccess && (
        <div className="p-4 bg-lime/10 border border-lime/30 rounded-xl text-xs text-lime font-bold flex items-center gap-2 font-heading">
          <CheckCircle2 className="w-4 h-4" /> Successfully imported {parsedCandles.length} candles for {symbol}!
        </div>
      )}

      {/* Errors Banner */}
      {errors.length > 0 && (
        <div className="p-4 bg-loss/10 border border-loss/30 rounded-xl text-xs text-loss font-bold space-y-1 font-heading">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> CSV Validation Errors Found:
          </div>
          <ul className="list-disc list-inside space-y-0.5 font-mono-num font-normal">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview Table */}
      {parsedCandles.length > 0 && (
        <div className="custom-card p-6 space-y-4 font-mono-num">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">
            Import Preview ({parsedCandles.length} Candles)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Open</th>
                  <th className="py-2.5 px-3">High</th>
                  <th className="py-2.5 px-3">Low</th>
                  <th className="py-2.5 px-3">Close</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {parsedCandles.slice(0, 10).map((c, idx) => (
                  <tr key={idx} className="hover:bg-bg-nested transition-colors">
                    <td className="py-2.5 px-3 text-text-muted">{c.timestamp}</td>
                    <td className="py-2.5 px-3 text-text-primary">${c.open}</td>
                    <td className="py-2.5 px-3 text-lime">${c.high}</td>
                    <td className="py-2.5 px-3 text-loss">${c.low}</td>
                    <td className="py-2.5 px-3 font-bold text-text-primary">${c.close}</td>
                    <td className="py-2.5 px-3 text-right text-text-secondary">{c.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
