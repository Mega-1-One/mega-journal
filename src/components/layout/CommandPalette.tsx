'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Table,
  BookOpen,
  Wallet,
  Calendar,
  BarChart3,
  BookMarked,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  X,
  Sun,
  Eye,
  Plus,
} from 'lucide-react';

export function CommandPalette() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, trades, setTheme, setPrivacyMode, setIsQuickAddOpen } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!isCommandPaletteOpen) return null;

  const routes = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Trades Log', href: '/trades', icon: Table },
    { name: 'Day Journal', href: '/journal', icon: BookOpen },
    { name: 'Accounts', href: '/accounts', icon: Wallet },
    { name: 'P&L Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics Reports', href: '/reports', icon: BarChart3 },
    { name: 'Strategies & Playbooks', href: '/strategies', icon: BookMarked },
    { name: 'Backtesting Lab', href: '/backtest', icon: FlaskConical },
    { name: 'Trading Rules', href: '/discipline', icon: ShieldCheck },
    { name: 'AI Trading Analyst', href: '/ai-analyst', icon: Sparkles },
  ];

  const filteredRoutes = routes.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const filteredTrades = trades.filter(
    (t) =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.account.toLowerCase().includes(query.toLowerCase()) ||
      (t.setup && t.setup.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (href: string) => {
    setIsCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-bg-border flex items-center gap-3 bg-bg-card">
          <Search className="w-5 h-5 text-lime" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, symbol (e.g. NAS100), or jump to page..."
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none"
          />
          <button onClick={() => setIsCommandPaletteOpen(false)} className="text-text-muted hover:text-text-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 border-b border-bg-border bg-bg-nested flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsQuickAddOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-lime text-bg-main font-bold flex items-center gap-1 font-heading"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Trade
          </button>
          <button
            onClick={() => {
              setPrivacyMode((prev) => !prev);
              setIsCommandPaletteOpen(false);
            }}
            className="px-2.5 py-1 rounded-lg bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary flex items-center gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Toggle Privacy Mode
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-bg-border">
          {/* Navigation Commands */}
          <div className="py-2">
            <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider font-heading">
              Navigation
            </div>
            {filteredRoutes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:bg-bg-nested hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-lime" />
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">Jump to page</span>
                </button>
              );
            })}
          </div>

          {/* Trade Search Matches */}
          {filteredTrades.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider font-heading">
                Matching Trades
              </div>
              {filteredTrades.slice(0, 5).map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(`/trades/${t.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-text-secondary hover:bg-bg-nested hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary font-heading">{t.symbol}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.direction === 'LONG' ? 'bg-lime/10 text-lime' : 'bg-loss/10 text-loss'}`}>
                      {t.direction}
                    </span>
                    <span className="text-text-muted">{t.account}</span>
                  </div>
                  <span className={`font-bold font-mono-num ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {t.netPnL >= 0 ? '+' : ''}${t.netPnL}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-bg-main border-t border-bg-border flex items-center justify-between text-[11px] text-text-muted font-medium">
          <span>Use arrow keys to navigate</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
