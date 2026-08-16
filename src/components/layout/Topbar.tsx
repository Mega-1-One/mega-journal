'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Bell,
  Calendar,
  Layers,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

export function Topbar() {
  const {
    theme,
    setTheme,
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    dateFilter,
    setDateFilter,
    displayMode,
    setDisplayMode,
    privacyMode,
    setPrivacyMode,
    setIsQuickAddOpen,
    setIsCommandPaletteOpen,
  } = useApp();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header className="h-16 bg-bg-surface border-b border-bg-border px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Left Filter & Controls */}
      <div className="flex items-center gap-3">
        {/* Account Selector */}
        <div className="flex items-center gap-2 bg-bg-card border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-secondary">
          <Layers className="w-3.5 h-3.5 text-lime" />
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-bg-card text-text-primary">
              All Accounts ({accounts.length})
            </option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id} className="bg-bg-card text-text-primary">
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-bg-card border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-lime" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-bg-card text-text-primary">All Time</option>
            <option value="TODAY" className="bg-bg-card text-text-primary">Today</option>
            <option value="THIS_WEEK" className="bg-bg-card text-text-primary">This Week</option>
            <option value="THIS_MONTH" className="bg-bg-card text-text-primary">This Month</option>
            <option value="LAST_30_DAYS" className="bg-bg-card text-text-primary">Last 30 Days</option>
          </select>
        </div>

        {/* Display Unit Switcher */}
        <div className="flex items-center bg-bg-card border border-bg-border rounded-lg p-1 text-xs">
          <button
            onClick={() => setDisplayMode('DOLLAR')}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              displayMode === 'DOLLAR' ? 'bg-lime text-bg-main shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            $
          </button>
          <button
            onClick={() => setDisplayMode('R_MULTIPLE')}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              displayMode === 'R_MULTIPLE' ? 'bg-lime text-bg-main shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            R
          </button>
          <button
            onClick={() => setDisplayMode('PERCENT')}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              displayMode === 'PERCENT' ? 'bg-lime text-bg-main shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            %
          </button>
          <button
            onClick={() => setDisplayMode('PIPS')}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              displayMode === 'PIPS' ? 'bg-lime text-bg-main shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Pips
          </button>
        </div>
      </div>

      {/* Right Tools & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Command Palette */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 bg-bg-card hover:bg-bg-nested border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-muted transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="bg-bg-main border border-bg-border text-[10px] text-text-muted px-1.5 py-0.5 rounded font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Theme Toggle (Dark / Light / System) */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary transition-colors"
          title={`Theme: ${theme.toUpperCase()} (Click to switch)`}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-lime" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Laptop className="w-4 h-4" />}
        </button>

        {/* Privacy Mode Switcher */}
        <button
          onClick={() => setPrivacyMode((prev) => !prev)}
          className={`p-2 rounded-lg border transition-colors ${
            privacyMode ? 'bg-warning/10 border-warning/30 text-warning' : 'bg-bg-card border-bg-border text-text-secondary hover:text-text-primary'
          }`}
          title={privacyMode ? 'Privacy Mode Active' : 'Enable Privacy Mode'}
        >
          {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-bg-card border border-bg-border text-text-secondary hover:text-text-primary relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-lime"></span>
        </button>

        {/* Primary Action: + Add Trade in Lime */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 bg-lime hover:bg-lime-hover text-bg-main text-xs font-black px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95 font-heading"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  );
}
