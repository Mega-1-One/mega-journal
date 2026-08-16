'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { FileText, Download, Printer, Calendar, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { analytics, filteredTrades, formatValue, activeAccountData } = useApp();
  const [reportPeriod, setReportPeriod] = useState('MONTHLY');

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-lime" /> Quantitative Trading Reports
          </h1>
          <p className="text-xs text-text-secondary">Generate executive performance, risk, and execution reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="bg-bg-card border border-bg-border rounded-xl px-3 py-2 text-xs text-text-primary font-heading font-bold focus:outline-none"
          >
            <option value="WEEKLY">Weekly Report</option>
            <option value="MONTHLY">Monthly Report</option>
            <option value="QUARTERLY">Quarterly Report</option>
            <option value="YEARLY">Yearly Report</option>
          </select>

          <button
            onClick={handlePrintPDF}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT CONTAINER */}
      <div className="custom-card p-8 space-y-6 font-mono-num border border-bg-border bg-bg-surface">
        {/* Report Header Branding */}
        <div className="flex items-center justify-between border-b border-bg-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime text-bg-main font-black flex items-center justify-center text-base font-heading shadow-glow">
              MJ
            </div>
            <div>
              <span className="text-xl font-black tracking-tight font-heading flex items-center gap-1">
                <span className="text-text-primary">MEGA</span>
                <span className="text-lime">JOURNAL</span>
              </span>
              <span className="text-xs text-text-muted block font-medium">The Trading Performance Journal</span>
            </div>
          </div>

          <div className="text-right text-xs text-text-muted">
            <span className="font-bold text-text-primary font-heading block uppercase">{reportPeriod} REPORT</span>
            <span>Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Net Realized P&L</span>
            <span className={`text-xl font-black font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {formatValue(analytics.netPnL)}
            </span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate %</span>
            <span className="text-xl font-black text-lime font-heading">{analytics.winRate}%</span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Profit Factor</span>
            <span className="text-xl font-black text-text-primary font-heading">{analytics.profitFactor}</span>
          </div>

          <div className="p-4 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown</span>
            <span className="text-xl font-black text-loss font-heading">{analytics.maxDrawdownPercent}%</span>
          </div>
        </div>

        {/* Trade Log Breakdown */}
        <div className="space-y-3 pt-4 border-t border-bg-border">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">
            Executed Trades ({filteredTrades.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Direction</th>
                  <th className="py-2.5 px-3">Entry</th>
                  <th className="py-2.5 px-3">Exit</th>
                  <th className="py-2.5 px-3">R-Multiple</th>
                  <th className="py-2.5 px-3 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filteredTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-bg-nested transition-colors">
                    <td className="py-2.5 px-3 text-text-muted">{new Date(t.entryTime).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-bold text-text-primary font-heading">{t.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.direction === 'LONG' ? 'text-lime bg-lime/10' : 'text-loss bg-loss/10'}`}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">${t.entryPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-text-secondary">${t.exitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-bold text-lime">+{t.rMultiple}R</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(t.netPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
