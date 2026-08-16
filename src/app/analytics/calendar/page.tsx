'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { TradeCalculated } from '@/lib/calculations';

export default function AnalyticsCalendarPage() {
  const { filteredTrades, formatValue } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ dateStr: string; trades: TradeCalculated[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group trades by date string YYYY-MM-DD
  const tradesByDateMap: Record<string, TradeCalculated[]> = {};
  filteredTrades.forEach((t) => {
    const d = new Date(t.entryTime);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!tradesByDateMap[dateKey]) tradesByDateMap[dateKey] = [];
    tradesByDateMap[dateKey].push(t);
  });

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrades = tradesByDateMap[dateKey] || [];
    const dayPnL = dayTrades.reduce((acc, t) => acc + t.netPnL, 0);
    calendarDays.push({ day, dateKey, trades: dayTrades, pnl: dayPnL });
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-lime" /> Monthly P&L Trading Calendar
            </h1>
            <p className="text-xs text-text-secondary">
              Daily P&L performance matrix. Click any trading day to inspect executed trades.
            </p>
          </div>
        </div>

        {/* Month Switcher */}
        <div className="flex items-center gap-3 font-heading font-bold text-xs">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-text-primary w-32 text-center font-mono-num">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="custom-card p-6 space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-muted uppercase font-heading">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2 font-mono-num">
          {calendarDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-24 bg-bg-nested/30 rounded-xl border border-bg-border/30 opacity-30" />;
            }

            const hasTrades = cell.trades.length > 0;
            const isProfit = cell.pnl > 0;
            const isLoss = cell.pnl < 0;

            return (
              <div
                key={cell.dateKey}
                onClick={() => hasTrades && setSelectedDayTrades({ dateStr: cell.dateKey, trades: cell.trades })}
                className={`h-24 p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  hasTrades ? 'cursor-pointer hover:border-lime/60 hover:scale-[1.02]' : 'opacity-60'
                } ${
                  isProfit
                    ? 'bg-lime/10 border-lime/30 text-lime'
                    : isLoss
                    ? 'bg-loss/10 border-loss/30 text-loss'
                    : 'bg-bg-nested border-bg-border text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold font-heading text-text-primary">{cell.day}</span>
                  {hasTrades && (
                    <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] font-bold text-text-secondary">
                      {cell.trades.length} T
                    </span>
                  )}
                </div>

                {hasTrades ? (
                  <div className="space-y-0.5 text-right">
                    <span className="text-xs font-black block font-heading">{formatValue(cell.pnl)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted italic block text-center">No trades</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Trades Modal */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-card">
              <div>
                <h3 className="text-base font-bold text-text-primary tracking-tight font-heading">
                  Trades executed on {selectedDayTrades.dateStr}
                </h3>
                <span className="text-xs text-text-muted font-mono-num">
                  Total: {selectedDayTrades.trades.length} trades
                </span>
              </div>
              <button onClick={() => setSelectedDayTrades(null)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3 font-mono-num text-xs">
              {selectedDayTrades.trades.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-bg-nested border border-bg-border flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary font-heading text-sm">{t.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.direction === 'LONG' ? 'text-lime bg-lime/10' : 'text-loss bg-loss/10'}`}>
                        {t.direction}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted block">{t.setup || 'General Setup'}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(t.netPnL)}
                    </span>
                    <Link
                      href={`/trades/${t.id}`}
                      className="p-2 rounded-xl bg-bg-card hover:bg-bg-surface text-text-muted hover:text-lime transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
