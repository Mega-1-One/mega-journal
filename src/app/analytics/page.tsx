'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  Flame,
  ArrowRight,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  calculateDrawdownDetails,
  calculateRDistribution,
  calculateWeekdayPerformance,
  calculateAnalyticsSummary,
} from '@/lib/calculations';

export default function AnalyticsPage() {
  const { filteredTrades, analytics, activeAccountData, formatValue, strategies, playbooks } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EQUITY' | 'R_DIST' | 'BREAKDOWNS'>('OVERVIEW');

  const startingBalance = activeAccountData?.startingBalance || 10000;
  const drawdownDetails = calculateDrawdownDetails(filteredTrades, startingBalance);
  const rDistribution = calculateRDistribution(filteredTrades);
  const weekdayStats = calculateWeekdayPerformance(filteredTrades);

  // Build Equity Growth Data
  let runningBal = startingBalance;
  const equityCurveData = [
    { date: 'Start', balance: startingBalance, drawdown: 0 },
    ...filteredTrades
      .slice()
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .map((t) => {
        runningBal += t.netPnL;
        return {
          date: new Date(t.entryTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: Math.round(runningBal * 100) / 100,
          pnl: t.netPnL,
        };
      }),
  ];

  // Symbol Performance Aggregation
  const symbolMap: Record<string, { count: number; pnl: number; wins: number }> = {};
  filteredTrades.forEach((t) => {
    if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { count: 0, pnl: 0, wins: 0 };
    symbolMap[t.symbol].count += 1;
    symbolMap[t.symbol].pnl += t.netPnL;
    if (t.isWin) symbolMap[t.symbol].wins += 1;
  });

  const symbolStats = Object.entries(symbolMap).map(([symbol, data]) => ({
    symbol,
    count: data.count,
    winRate: Math.round((data.wins / data.count) * 100),
    pnl: Math.round(data.pnl * 100) / 100,
  }));

  // Session Performance Aggregation
  const sessionMap: Record<string, { count: number; pnl: number; wins: number }> = {};
  filteredTrades.forEach((t) => {
    const s = t.session || 'NEW_YORK';
    if (!sessionMap[s]) sessionMap[s] = { count: 0, pnl: 0, wins: 0 };
    sessionMap[s].count += 1;
    sessionMap[s].pnl += t.netPnL;
    if (t.isWin) sessionMap[s].wins += 1;
  });

  const sessionStats = Object.entries(sessionMap).map(([session, data]) => ({
    session,
    count: data.count,
    winRate: Math.round((data.wins / data.count) * 100),
    pnl: Math.round(data.pnl * 100) / 100,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lime" /> Advanced Performance Analytics Workspace
          </h1>
          <p className="text-xs text-text-secondary">
            Deep quantitative insights, drawdown math, R-multiple distributions, and setup breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3 font-heading font-bold text-xs">
          <Link
            href="/analytics/calendar"
            className="btn-secondary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-lime" />
            <span>Monthly P&L Calendar</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-bg-border pb-3 font-heading">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Overview & Drawdown
        </button>
        <button
          onClick={() => setActiveTab('EQUITY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EQUITY' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Equity Growth Curve
        </button>
        <button
          onClick={() => setActiveTab('R_DIST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'R_DIST' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          R-Multiple Distribution
        </button>
        <button
          onClick={() => setActiveTab('BREAKDOWNS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BREAKDOWNS' ? 'bg-lime text-bg-main shadow-glow' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Breakdowns (Symbol & Session)
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono-num">
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Total Net P&L</span>
          <span className={`text-xl font-black font-heading ${analytics.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
            {formatValue(analytics.netPnL)}
          </span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Win Rate</span>
          <span className="text-xl font-black text-lime font-heading">{analytics.winRate}%</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Profit Factor</span>
          <span className="text-xl font-black text-text-primary font-heading">{analytics.profitFactor}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Average R</span>
          <span className="text-xl font-black text-lime font-heading">+{analytics.averageR}R</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Expectancy</span>
          <span className="text-xl font-black text-lime font-heading">${analytics.expectancy}</span>
        </div>
        <div className="custom-card p-4">
          <span className="text-[10px] font-bold text-text-muted uppercase block font-heading mb-1">Max Drawdown</span>
          <span className="text-xl font-black text-loss font-heading">{drawdownDetails.maxDrawdownPercent}%</span>
        </div>
      </div>

      {/* PEAK-TO-TROUGH DRAWDOWN ANALYSIS CARD */}
      <div className="custom-card p-6 space-y-4 border-l-4 border-loss">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <Activity className="w-4 h-4 text-loss" /> Peak-to-Trough Drawdown Analysis
          </h3>
          <span className="text-xs text-text-muted font-mono-num font-heading">
            Status: <strong className={drawdownDetails.isRecovered ? 'text-lime' : 'text-loss'}>{drawdownDetails.isRecovered ? 'Recovered / Peak Equity' : 'In Drawdown'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono-num text-center">
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Peak Balance</span>
            <span className="text-sm font-bold text-text-primary">${drawdownDetails.peakBalance.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown ($)</span>
            <span className="text-sm font-bold text-loss">-${drawdownDetails.maxDrawdownAmount.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Max Drawdown (%)</span>
            <span className="text-sm font-bold text-loss">{drawdownDetails.maxDrawdownPercent}%</span>
          </div>
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Drawdown Duration</span>
            <span className="text-sm font-bold text-text-secondary">{drawdownDetails.drawdownDurationTrades} trades</span>
          </div>
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
            <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Recovery Factor</span>
            <span className="text-sm font-bold text-lime">{analytics.recoveryFactor}</span>
          </div>
        </div>
      </div>

      {/* Advanced Equity Curve Recharts Area Chart */}
      <div className="custom-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-lime" /> Advanced Cumulative Equity Growth Curve
          </h3>
          <span className="text-xs text-text-muted font-mono-num font-heading">Starting Capital: ${startingBalance.toLocaleString()}</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurveData}>
              <defs>
                <linearGradient id="analyticsLimeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C8FF00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6F767D" fontSize={10} tickLine={false} />
              <YAxis stroke="#6F767D" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', borderRadius: '8px', color: '#F5F5F5', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="balance" stroke="#C8FF00" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsLimeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* R-MULTIPLE DISTRIBUTION HISTOGRAM & WEEKDAY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* R Distribution */}
        <div className="lg:col-span-6 custom-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-lime" /> R-Multiple Distribution Histogram
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rDistribution}>
                <XAxis dataKey="label" stroke="#6F767D" fontSize={10} tickLine={false} />
                <YAxis stroke="#6F767D" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#15191D', borderColor: '#262B30', color: '#F5F5F5', fontSize: '11px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {rDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekday Performance */}
        <div className="lg:col-span-6 custom-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
            <Calendar className="w-4 h-4 text-lime" /> Performance Breakdown by Day of Week
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-num">
              <thead>
                <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Trades</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3">Avg R</th>
                  <th className="py-2.5 px-3 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {weekdayStats.map((stat) => (
                  <tr key={stat.day} className="hover:bg-bg-nested transition-colors">
                    <td className="py-3 px-3 font-bold text-text-primary font-heading">{stat.day}</td>
                    <td className="py-3 px-3 text-text-secondary">{stat.trades}</td>
                    <td className="py-3 px-3 text-lime font-bold">{stat.winRate}%</td>
                    <td className="py-3 px-3 text-text-primary">+{stat.averageR}R</td>
                    <td className={`py-3 px-3 text-right font-bold ${stat.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(stat.netPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SYMBOL & SESSION BREAKDOWNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Symbol Breakdown */}
        <div className="lg:col-span-6 custom-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Symbol Breakdown</h3>
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
                {symbolStats.map((item) => (
                  <tr key={item.symbol} className="hover:bg-bg-nested transition-colors">
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

        {/* Session Breakdown */}
        <div className="lg:col-span-6 custom-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Session Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono-num">
              <thead>
                <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Trades</th>
                  <th className="py-2.5 px-3">Win Rate</th>
                  <th className="py-2.5 px-3 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {sessionStats.map((item) => (
                  <tr key={item.session} className="hover:bg-bg-nested transition-colors">
                    <td className="py-3 px-3 font-bold text-text-primary font-heading">{item.session}</td>
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
    </div>
  );
}
