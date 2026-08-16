'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const { filteredTrades, formatValue } = useApp();

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const dailyPnLMap: Record<number, { pnl: number; count: number; wins: number }> = {};
  filteredTrades.forEach((t) => {
    const day = new Date(t.entryTime).getDate();
    if (!dailyPnLMap[day]) {
      dailyPnLMap[day] = { pnl: 0, count: 0, wins: 0 };
    }
    dailyPnLMap[day].pnl += t.netPnL;
    dailyPnLMap[day].count += 1;
    if (t.isWin) dailyPnLMap[day].wins += 1;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-lime" /> Monthly P&L Calendar
          </h1>
          <p className="text-xs text-text-secondary">Visual day-by-day P&L distribution and win/loss state</p>
        </div>

        <div className="flex items-center gap-2 bg-bg-card border border-bg-border rounded-xl px-3 py-1.5 text-xs text-text-secondary font-heading font-bold">
          <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-text-primary" />
          <span className="font-bold text-text-primary">August 2026</span>
          <ChevronRight className="w-4 h-4 cursor-pointer hover:text-text-primary" />
        </div>
      </div>

      <div className="custom-card p-6">
        <div className="grid grid-cols-7 gap-3 mb-3 text-center text-xs font-bold text-text-muted uppercase tracking-wider font-heading">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {daysInMonth.map((day) => {
            const data = dailyPnLMap[day];
            const hasData = !!data;
            const isProfit = hasData && data.pnl >= 0;

            return (
              <div
                key={day}
                className={`min-h-[90px] p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  hasData
                    ? isProfit
                      ? 'bg-lime/5 border-lime/30'
                      : 'bg-loss/5 border-loss/30'
                    : 'bg-bg-nested border-bg-border'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-text-muted font-heading">
                  <span>{day}</span>
                  {hasData && (
                    <span className="text-[10px] text-text-muted font-medium font-mono-num">{data.count} trades</span>
                  )}
                </div>

                {hasData ? (
                  <div className="font-mono-num">
                    <span className={`text-sm font-black block font-heading ${isProfit ? 'text-lime' : 'text-loss'}`}>
                      {formatValue(data.pnl)}
                    </span>
                    <span className="text-[10px] text-text-muted block font-medium">
                      {data.wins}W - {data.count - data.wins}L
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-text-muted block">No trades</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
