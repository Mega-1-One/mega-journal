'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Flame } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const { filteredTrades, analytics, activeAccountData, formatValue, setIsQuickAddOpen } = useApp();

  const startingBalance = activeAccountData?.startingBalance || 10000;
  const currentBalance = activeAccountData ? activeAccountData.currentBalance : startingBalance + analytics.netPnL;

  // Build Equity Curve from Real Database Trades
  let runningBalance = startingBalance;
  const equityCurveData = [
    { date: 'Start', balance: startingBalance, pnl: 0 },
    ...filteredTrades
      .slice()
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .map((t) => {
        runningBalance += t.netPnL;
        return {
          date: new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.round(runningBalance * 100) / 100,
          pnl: t.netPnL,
        };
      }),
  ];

  // Win/Loss Pie Data
  const pieData = [
    { name: 'Wins', value: analytics.winningTrades, color: '#C8FF00' },
    { name: 'Losses', value: analytics.losingTrades, color: '#EF4444' },
    { name: 'Breakeven', value: analytics.breakEvenTrades, color: '#6F767D' },
  ];

  // Performance by Symbol
  const symbolStatsMap: Record<string, { count: number; pnl: number; wins: number }> = {};
  filteredTrades.forEach((t) => {
    if (!symbolStatsMap[t.symbol]) {
      symbolStatsMap[t.symbol] = { count: 0, pnl: 0, wins: 0 };
    }
    symbolStatsMap[t.symbol].count += 1;
    symbolStatsMap[t.symbol].pnl += t.netPnL;
    if (t.isWin) symbolStatsMap[t.symbol].wins += 1;
  });

  const symbolList = Object.entries(symbolStatsMap).map(([symbol, data]) => ({
    symbol,
    count: data.count,
    pnl: Math.round(data.pnl * 100) / 100,
    winRate: Math.round((data.wins / data.count) * 100),
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading">Dashboard</h1>
          <p className="text-xs text-text-secondary">Your trading performance at a glance.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Hero Accent Performance Card */}
      <div className="custom-card p-6 border-l-4 border-lime bg-bg-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-lime uppercase tracking-widest font-heading">NET PERFORMANCE</span>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl font-black font-mono-num font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {formatValue(analytics.netPnL)}
            </span>
            <span className="text-xs text-text-secondary font-mono-num">
              {analytics.netPnL >= 0 ? '+' : ''}
              {Math.round((analytics.netPnL / startingBalance) * 10000) / 100}% Return
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-num border-t md:border-t-0 md:border-l border-bg-border pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Profit Factor</span>
            <span className="text-lg font-bold text-text-primary">{analytics.profitFactor}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Win Rate</span>
            <span className="text-lg font-bold text-lime">{analytics.winRate}%</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Average R</span>
            <span className="text-lg font-bold text-text-primary">+{analytics.averageR}R</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown</span>
            <span className="text-lg font-bold text-loss">{analytics.maxDrawdownPercent}%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono-num">
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Account Balance</span>
          <span className="text-xl font-black text-text-primary font-heading">{formatValue(currentBalance)}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Total Trades</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.totalTrades}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average Win</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.averageWin}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average Loss</span>
          <span className="text-xl font-black text-loss font-heading">-${analytics.averageLoss}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Expectancy</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.expectancy}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Win Streak</span>
          <span className="text-xl font-black text-lime font-heading flex items-center gap-1">
            <Flame className="w-4 h-4 fill-lime" /> {analytics.currentWinStreak}
          </span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Equity Curve Area Chart */}
        <div className="lg:col-span-8 custom-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Account Equity Growth Curve</h3>
            <span className="text-xs text-text-muted font-mono-num font-heading">Starting: ${startingBalance.toLocaleString()}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurveData}>
                <defs>
                  <linearGradient id="equityLimeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8FF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6F767D" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F767D" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', borderRadius: '8px', color: '#F5F5F5', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#C8FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#equityLimeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win / Loss Donut Chart */}
        <div className="lg:col-span-4 custom-card p-5 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Win / Loss Distribution</h3>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', color: '#F5F5F5', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-num">
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Wins</span>
              <span className="font-bold text-lime">{analytics.winningTrades}</span>
            </div>
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Losses</span>
              <span className="font-bold text-loss">{analytics.losingTrades}</span>
            </div>
            <div className="p-2 rounded-xl bg-bg-nested border border-bg-border">
              <span className="text-[10px] text-text-muted block font-heading">Breakeven</span>
              <span className="font-bold text-text-muted">{analytics.breakEvenTrades}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Symbol Table */}
      <div className="custom-card p-5 space-y-4">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Performance Breakdown by Instrument</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono-num">
            <thead>
              <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Trades</th>
                <th className="py-2.5 px-3">Win Rate</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {symbolList.map((item) => (
                <tr key={item.symbol} className="hover:bg-bg-nested/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-text-primary font-heading">{item.symbol}</td>
                  <td className="py-3 px-3 text-text-secondary">{item.count}</td>
                  <td className="py-3 px-3 text-lime font-bold">{item.winRate}%</td>
                  <td className={`py-3 px-3 text-right font-bold ${item.pnl >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(item.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
