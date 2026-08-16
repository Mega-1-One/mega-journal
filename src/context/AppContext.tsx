'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradeCalculated, calculateTradeMetrics, calculateAnalyticsSummary, AnalyticsSummary } from '@/lib/calculations';
import { DEMO_ACCOUNTS, DEMO_PROP_FIRMS, DEMO_STRATEGIES, getInitialCalculatedTrades, AccountData, PropFirmData, StrategyData } from '@/lib/store';

export type DisplayMode = 'DOLLAR' | 'PERCENT' | 'R_MULTIPLE' | 'PIPS';
export type DateFilter = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS';
export type ThemeMode = 'dark' | 'light' | 'system';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  accounts: AccountData[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  privacyMode: boolean;
  setPrivacyMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  trades: TradeCalculated[];
  addTrade: (t: Partial<TradeCalculated>) => void;
  deleteTrade: (id: string) => void;
  updateTrade: (id: string, updated: Partial<TradeCalculated>) => void;
  propFirms: PropFirmData[];
  strategies: StrategyData[];
  addStrategy: (s: StrategyData) => void;
  analytics: AnalyticsSummary;
  filteredTrades: TradeCalculated[];
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  formatValue: (amount: number, unit?: DisplayMode, initialRisk?: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [accounts, setAccounts] = useState<AccountData[]>(DEMO_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('DOLLAR');
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [trades, setTrades] = useState<TradeCalculated[]>([]);
  const [propFirms, setPropFirms] = useState<PropFirmData[]>(DEMO_PROP_FIRMS);
  const [strategies, setStrategies] = useState<StrategyData[]>(DEMO_STRATEGIES);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initialize theme & load saved preference
  useEffect(() => {
    const savedTheme = (localStorage.getItem('mj_theme') as ThemeMode) || 'dark';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('mj_theme', mode);
    applyTheme(mode);
  };

  const applyTheme = (mode: ThemeMode) => {
    const html = document.documentElement;
    if (mode === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else if (mode === 'dark') {
      html.classList.remove('light');
      html.classList.add('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.remove('light', 'dark');
      html.classList.add(isDark ? 'dark' : 'light');
    }
  };

  // Initialize trade data
  useEffect(() => {
    const initial = getInitialCalculatedTrades();
    setTrades(initial);
  }, []);

  // Keyboard shortcut for Command Palette (CTRL + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter trades based on active account and date filter
  const filteredTrades = trades.filter((t) => {
    if (selectedAccountId !== 'ALL' && t.account !== selectedAccountId) {
      const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
      if (selectedAccount && t.account !== selectedAccount.name) {
        return false;
      }
    }

    if (dateFilter === 'ALL') return true;
    const tradeDate = new Date(t.entryTime);
    const now = new Date();

    if (dateFilter === 'TODAY') {
      return tradeDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'THIS_WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return tradeDate >= oneWeekAgo;
    } else if (dateFilter === 'THIS_MONTH') {
      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'LAST_30_DAYS') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return tradeDate >= thirtyDaysAgo;
    }
    return true;
  });

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const initialBalance = selectedAccount ? selectedAccount.startingBalance : 100000;
  const analytics = calculateAnalyticsSummary(filteredTrades, initialBalance);

  const addTrade = (t: Partial<TradeCalculated>) => {
    const calculated = calculateTradeMetrics(t as any);
    setTrades((prev) => [calculated, ...prev]);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === calculated.account || acc.id === selectedAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + calculated.netPnL };
        }
        return acc;
      })
    );
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTrade = (id: string, updated: Partial<TradeCalculated>) => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return calculateTradeMetrics({ ...t, ...updated } as any);
        }
        return t;
      })
    );
  };

  const addStrategy = (s: StrategyData) => {
    setStrategies((prev) => [...prev, s]);
  };

  const formatValue = (amount: number, modeOverride?: DisplayMode, risk: number = 100): string => {
    if (privacyMode) return '••••••';
    const mode = modeOverride || displayMode;

    if (mode === 'PERCENT') {
      const pct = (amount / initialBalance) * 100;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
    } else if (mode === 'R_MULTIPLE') {
      const r = risk > 0 ? amount / risk : 0;
      return `${r >= 0 ? '+' : ''}${r.toFixed(2)}R`;
    } else if (mode === 'PIPS') {
      return `${amount >= 0 ? '+' : ''}${Math.round(amount * 10)} pips`;
    }

    return `${amount >= 0 ? '+' : '-'}\$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppContext.Provider
      value={{
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
        trades,
        addTrade,
        deleteTrade,
        updateTrade,
        propFirms,
        strategies,
        addStrategy,
        analytics,
        filteredTrades,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        formatValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
