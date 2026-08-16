'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  ChevronRight,
  Sparkles,
  PieChart as PieIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { analytics, filteredTrades, formatValue, privacyMode, accounts, selectedAccountId } = useApp();

  const selectedAcc = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const currentBalance = selectedAcc ? selectedAcc.currentBalance : 108450;

  // Prepare Equity Curve Data
  let cumulative = selectedAcc ? selectedAcc.startingBalance : 100000;
  const equityData = filteredTrades
    .slice()
    .reverse()
    .map((t, idx) => {
      cumulative += t.netPnL;
      return {
        tradeIndex: `Trade #${idx + 1}`,
        date: new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        equity: cumulative,
        netPnL: t.netPnL,
      };
    });

  // Performance by Instrument Data
  const instrumentMap: Record<string, { symbol: string; pnl: number; count: number }> = {};
  filteredTrades.forEach((t) => {
    if (!instrumentMap[t.symbol]) {
      instrumentMap[t.symbol] = { symbol: t.symbol, pnl: 0, count: 0 };
    }
    instrumentMap[t.symbol].pnl += t.netPnL;
    instrumentMap[t.symbol].count += 1;
  });
  const instrumentData = Object.values(instrumentMap);

  // Win/Loss Pie Data
  const winLossData = [
    { name: 'Winning Trades', value: analytics.winningTrades, color: '#C8FF00' },
    { name: 'Losing Trades', value: analytics.losingTrades, color: '#EF4444' },
    { name: 'Break Even', value: analytics.breakEvenTrades, color: '#6F767D' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading">
            Dashboard
          </h1>
          <p className="text-xs text-text-secondary">Your trading performance at a glance.</p>
        </div>

        <div className="flex items-center gap-4 bg-bg-card p-3 rounded-xl border border-bg-border">
          <div className="text-right">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block font-heading">
              Account Balance
            </span>
            <span className="text-xl font-black text-text-primary tracking-tight font-mono-num font-heading">
              {privacyMode ? '••••••' : `$${currentBalance.toLocaleString()}`}
            </span>
          </div>
          <Link
            href="/journal"
            className="flex items-center gap-1.5 bg-bg-nested hover:bg-bg-card text-text-primary border border-bg-border px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-lime" />
            <span>Open Journal</span>
          </Link>
        </div>
      </div>

      {/* Hero Performance Card & Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* HERO CARD: Net P&L (Accent Border) */}
        <div className="custom-card p-4 border-lime/40 bg-bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-lime/5 rounded-bl-full pointer-events-none"></div>
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Net P&L
          </span>
          <span className={`text-xl font-black tracking-tight block font-mono-num font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
            {formatValue(analytics.netPnL)}
          </span>
          <span className="text-[10px] text-text-muted mt-1 block font-medium">Total Closed Trades</span>
        </div>

        {/* Account Balance */}
        <div className="custom-card p-4">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Account Balance
          </span>
          <span className="text-xl font-black text-text-primary tracking-tight block font-mono-num font-heading">
            {privacyMode ? '••••••' : `$${currentBalance.toLocaleString()}`}
          </span>
          <span className="text-[10px] text-text-muted mt-1 block font-medium">Selected Portfolio</span>
        </div>

        {/* Win Rate */}
        <div className="custom-card p-4">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Win Rate
          </span>
          <span className="text-xl font-black text-text-primary tracking-tight block font-mono-num font-heading">{analytics.winRate}%</span>
          <span className="text-[10px] text-lime mt-1 block font-semibold">
            {analytics.winningTrades} W / {analytics.losingTrades} L
          </span>
        </div>

        {/* Profit Factor */}
        <div className="custom-card p-4">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Profit Factor
          </span>
          <span className="text-xl font-black text-text-primary tracking-tight block font-mono-num font-heading">{analytics.profitFactor}</span>
          <span className="text-[10px] text-text-muted mt-1 block font-medium">Gross Profit / Loss</span>
        </div>

        {/* Average R */}
        <div className="custom-card p-4">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Average R
          </span>
          <span className="text-xl font-black text-lime tracking-tight block font-mono-num font-heading">
            {analytics.averageR >= 0 ? '+' : ''}{analytics.averageR}R
          </span>
          <span className="text-[10px] text-text-muted mt-1 block font-medium font-mono-num">Risk Multiple Return</span>
        </div>

        {/* Max Drawdown */}
        <div className="custom-card p-4">
          <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1 font-heading">
            Max Drawdown
          </span>
          <span className="text-xl font-black text-loss tracking-tight block font-mono-num font-heading">
            {analytics.maxDrawdownPercent}%
          </span>
          <span className="text-[10px] text-text-muted mt-1 block font-medium font-mono-num">Peak-to-Trough Drop</span>
        </div>
      </div>

      {/* Main Equity Curve Chart & Performance Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2 cols) */}
        <div className="lg:col-span-2 custom-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-text-primary tracking-tight flex items-center gap-2 font-heading">
                <TrendingUp className="w-4 h-4 text-lime" /> Equity Curve
              </h2>
              <p className="text-xs text-text-secondary">Cumulative account equity trajectory over executed trade history</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20 font-heading">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C8FF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '0.5rem', color: 'var(--text-primary)' }}
                  formatter={(value: any) => [privacyMode ? '••••••' : `$${Number(value).toLocaleString()}`, 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="#C8FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win/Loss & Instrument Breakdown (1 col) */}
        <div className="space-y-6">
          {/* Win/Loss Pie Chart */}
          <div className="custom-card p-5">
            <h3 className="text-xs font-bold text-text-primary tracking-tight mb-3 flex items-center gap-2 font-heading">
              <PieIcon className="w-4 h-4 text-lime" /> Win / Loss Distribution
            </h3>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={winLossData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '0.5rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs font-bold pt-2 border-t border-bg-border font-heading">
              <span className="text-lime">{analytics.winningTrades} Wins</span>
              <span className="text-loss">{analytics.losingTrades} Losses</span>
              <span className="text-text-muted">{analytics.breakEvenTrades} BE</span>
            </div>
          </div>

          {/* Performance by Symbol */}
          <div className="custom-card p-5">
            <h3 className="text-xs font-bold text-text-primary tracking-tight mb-3 flex items-center gap-2 font-heading">
              <Activity className="w-4 h-4 text-lime" /> Performance by Symbol
            </h3>
            <div className="space-y-2">
              {instrumentData.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between text-xs p-2 rounded-lg bg-bg-nested border border-bg-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary font-heading">{item.symbol}</span>
                    <span className="text-[10px] text-text-muted">({item.count} trades)</span>
                  </div>
                  <span className={`font-bold font-mono-num ${item.pnl >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(item.pnl)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="custom-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight font-heading">Recent Executions</h2>
            <p className="text-xs text-text-secondary">Latest trade logs recorded into Mega Journal</p>
          </div>
          <Link href="/trades" className="text-xs font-bold text-lime hover:underline flex items-center gap-1 font-heading">
            <span>View All Trades</span> <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-bg-border text-text-muted font-bold text-[10px] uppercase tracking-wider font-heading">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Entry / Exit</th>
                <th className="py-2.5 px-3">R-Multiple</th>
                <th className="py-2.5 px-3">Net P&L</th>
                <th className="py-2.5 px-3">Setup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {filteredTrades.slice(0, 5).map((t) => (
                <tr key={t.id} className="hover:bg-bg-nested/60 transition-colors">
                  <td className="py-3 px-3 text-text-secondary font-mono-num">{new Date(t.entryTime).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-bold text-text-primary font-heading">{t.symbol}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.direction === 'LONG' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-loss/10 text-loss border border-loss/20'}`}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary font-mono-num">
                    {t.entryPrice} → {t.exitPrice}
                  </td>
                  <td className="py-3 px-3 font-bold text-lime font-mono-num">{t.rMultiple >= 0 ? '+' : ''}{t.rMultiple}R</td>
                  <td className={`py-3 px-3 font-bold font-mono-num ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(t.netPnL)}
                  </td>
                  <td className="py-3 px-3 text-text-muted">{t.setup || 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
