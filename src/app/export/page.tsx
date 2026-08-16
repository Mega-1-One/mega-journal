'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { Download, FileSpreadsheet, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ExportPage() {
  const { trades, accounts, strategies, playbooks, backtestSessions } = useApp();
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportTrades = () => {
    if (exportFormat === 'JSON') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trades, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `MEGA_JOURNAL_TRADES_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = 'ID,Date,Symbol,Direction,Entry,Exit,Quantity,P&L,R,Account,Setup,Session,Mistake,Emotion\n';
      const rows = trades
        .map(
          (t) =>
            `${t.id},${t.entryTime},${t.symbol},${t.direction},${t.entryPrice},${t.exitPrice},${t.quantity},${t.netPnL},${t.rMultiple},"${t.account}","${t.setup}","${t.session}","${t.mistake}","${t.emotion}"`
        )
        .join('\n');
      const csvStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvStr);
      downloadAnchor.setAttribute('download', `MEGA_JOURNAL_TRADES_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Download className="w-5 h-5 text-lime" /> Data Export Hub
          </h1>
          <p className="text-xs text-text-secondary">Export filtered trading logs, accounts, strategies, and backtest data.</p>
        </div>
      </div>

      {/* FORMAT SELECTOR & EXPORT CARDS */}
      <div className="custom-card p-6 space-y-6 font-mono-num">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Select Export Format</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExportFormat('CSV')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
                exportFormat === 'CSV' ? 'bg-lime text-bg-main shadow-glow' : 'bg-bg-nested text-text-muted'
              }`}
            >
              CSV Spreadsheet
            </button>
            <button
              onClick={() => setExportFormat('JSON')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-heading transition-all ${
                exportFormat === 'JSON' ? 'bg-lime text-bg-main shadow-glow' : 'bg-bg-nested text-text-muted'
              }`}
            >
              JSON Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-bg-nested border border-bg-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary font-heading text-sm">Trade Records</span>
              <span className="text-xs font-bold text-lime">{trades.length} Trades</span>
            </div>
            <p className="text-[11px] text-text-muted">Complete trade history including P&L, R-multiples, and notes.</p>
            <button
              onClick={handleExportTrades}
              className="w-full btn-primary-lime py-2 rounded-xl text-xs font-heading font-black flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Trades ({exportFormat})
            </button>
          </div>

          <div className="p-5 rounded-xl bg-bg-nested border border-bg-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary font-heading text-sm">Trading Accounts</span>
              <span className="text-xs font-bold text-lime">{accounts.length} Accounts</span>
            </div>
            <p className="text-[11px] text-text-muted">Account balances, brokers, and risk configuration rules.</p>
            <button
              onClick={handleExportTrades}
              className="w-full btn-secondary py-2 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Accounts
            </button>
          </div>

          <div className="p-5 rounded-xl bg-bg-nested border border-bg-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text-primary font-heading text-sm">Strategies & Playbooks</span>
              <span className="text-xs font-bold text-lime">{strategies.length} Strategies</span>
            </div>
            <p className="text-[11px] text-text-muted">Trading playbooks, entry models, and rule checklists.</p>
            <button
              onClick={handleExportTrades}
              className="w-full btn-secondary py-2 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Strategies
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-lime/10 border border-lime/30 rounded-xl text-xs text-lime font-bold flex items-center gap-2 font-heading">
            <CheckCircle2 className="w-4 h-4" /> Export file generated and downloaded successfully!
          </div>
        )}
      </div>
    </div>
  );
}
