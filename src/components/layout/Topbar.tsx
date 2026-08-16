'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { usePathname } from 'next/navigation';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Calendar,
  Wallet,
} from 'lucide-react';
import { DatePreset } from '@/lib/dates';

export function Topbar() {
  const pathname = usePathname();
  const {
    theme,
    setTheme,
    selectedAccount,
    setSelectedAccount,
    accounts,
    datePreset,
    setDatePreset,
    isPrivacyMode,
    setIsPrivacyMode,
    setIsQuickAddOpen,
    setIsCommandPaletteOpen,
  } = useApp();

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/trades') return 'Trade Log';
    if (pathname.startsWith('/trades/')) return 'Trade Detail Workspace';
    if (pathname === '/accounts') return 'Account Management';
    if (pathname === '/calendar') return 'P&L Monthly Calendar';
    if (pathname === '/strategies') return 'Strategy Playbooks';
    if (pathname === '/reports') return 'Quantitative Reports';
    if (pathname === '/backtest') return 'Backtesting Lab';
    if (pathname === '/journal') return 'Daily Journal';
    if (pathname === '/notebook') return 'Notebook';
    if (pathname === '/discipline') return 'Trading Rules & Discipline';
    if (pathname === '/goals') return 'Goals & Targets';
    if (pathname === '/prop-firm') return 'Prop Firm Risk Monitor';
    if (pathname === '/import') return 'Broker CSV Importer';
    if (pathname === '/settings') return 'Settings & Preferences';
    return 'Mega Journal';
  };

  return (
    <header className="h-16 border-b border-bg-border bg-bg-surface px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Page Title & Search */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-base font-black text-text-primary tracking-tight font-heading">{getPageTitle()}</h2>
          <span className="text-[10px] text-text-muted hidden sm:block">Your trading performance at a glance.</span>
        </div>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 bg-bg-main border border-bg-border rounded-xl px-3 py-1.5 text-xs text-text-muted hover:text-text-primary hover:border-lime/40 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-lime" />
          <span>Search trades, strategies...</span>
          <kbd className="bg-bg-card border border-bg-border px-1.5 py-0.5 rounded text-[10px] font-mono text-text-muted">Ctrl+K</kbd>
        </button>
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Account Selector */}
        <div className="relative flex items-center gap-1.5 bg-bg-main border border-bg-border rounded-xl px-3 py-1.5 text-xs">
          <Wallet className="w-3.5 h-3.5 text-lime" />
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="bg-transparent text-text-primary font-bold focus:outline-none cursor-pointer pr-1 font-heading"
          >
            <option value="ALL" className="bg-bg-card text-text-primary">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name} className="bg-bg-card text-text-primary">
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-bg-main border border-bg-border rounded-xl px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
            className="bg-transparent text-text-secondary font-medium focus:outline-none cursor-pointer hover:text-text-primary"
          >
            <option value="ALL" className="bg-bg-card text-text-primary">All Time</option>
            <option value="TODAY" className="bg-bg-card text-text-primary">Today</option>
            <option value="YESTERDAY" className="bg-bg-card text-text-primary">Yesterday</option>
            <option value="THIS_WEEK" className="bg-bg-card text-text-primary">This Week</option>
            <option value="LAST_WEEK" className="bg-bg-card text-text-primary">Last Week</option>
            <option value="THIS_MONTH" className="bg-bg-card text-text-primary">This Month</option>
            <option value="LAST_MONTH" className="bg-bg-card text-text-primary">Last Month</option>
            <option value="THIS_YEAR" className="bg-bg-card text-text-primary">This Year</option>
          </select>
        </div>

        {/* Privacy Toggle */}
        <button
          onClick={() => setIsPrivacyMode(!isPrivacyMode)}
          className="p-2 rounded-xl bg-bg-main hover:bg-bg-nested text-text-muted hover:text-text-primary border border-bg-border transition-colors"
          title={isPrivacyMode ? 'Show Financial Values' : 'Hide Financial Values (Privacy Mode)'}
        >
          {isPrivacyMode ? <EyeOff className="w-4 h-4 text-warning" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl bg-bg-main hover:bg-bg-nested text-text-muted hover:text-text-primary border border-bg-border transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-text-primary" /> : <Sun className="w-4 h-4 text-lime" />}
        </button>

        {/* Primary Action Button (#C8FF00 background, #0B0D0F text, N shortcut tooltip) */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          title="Add Trade (Press N)"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Add Trade</span>
          <kbd className="hidden lg:inline-block bg-black/20 text-black px-1.5 py-0.2 rounded text-[10px] font-mono">N</kbd>
        </button>
      </div>
    </header>
  );
}
