'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  TradeCalculated,
  AnalyticsSummary,
  calculateTradeMetrics,
  calculateAnalyticsSummary,
} from '@/lib/calculations';
import {
  AccountData,
  PropFirmData,
  StrategyData,
  DEMO_ACCOUNTS,
  DEMO_PROP_FIRMS,
  DEMO_STRATEGIES,
  getInitialCalculatedTrades,
} from '@/lib/store';

export type ThemeMode = 'dark' | 'light' | 'system';
export type DisplayUnit = 'DOLLAR' | 'PERCENT' | 'R_MULTIPLE' | 'PIPS';
export type DateRange = 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  displayUnit: DisplayUnit;
  setDisplayUnit: (u: DisplayUnit) => void;

  dateRange: DateRange;
  setDateRange: (d: DateRange) => void;

  selectedAccount: string;
  setSelectedAccount: (acc: string) => void;

  isPrivacyMode: boolean;
  setIsPrivacyMode: (p: boolean) => void;
  setPrivacyMode: (p: boolean) => void;

  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (o: boolean) => void;

  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (o: boolean) => void;

  accounts: AccountData[];
  activeAccountData?: AccountData;
  addAccount: (acc: AccountData) => void;
  updateAccount: (id: string, updates: Partial<AccountData>) => void;
  deleteAccount: (id: string) => void;

  propFirms: PropFirmData[];

  strategies: StrategyData[];
  addStrategy: (s: StrategyData) => void;

  trades: TradeCalculated[];
  filteredTrades: TradeCalculated[];
  analytics: AnalyticsSummary;

  addTrade: (t: any) => void;
  updateTrade: (id: string, updates: Partial<TradeCalculated>) => void;
  deleteTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;

  formatValue: (amount: number, unitOverride?: DisplayUnit, riskAmount?: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('DOLLAR');
  const [dateRange, setDateRange] = useState<DateRange>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<AccountData[]>(DEMO_ACCOUNTS);
  const [propFirms] = useState<PropFirmData[]>(DEMO_PROP_FIRMS);
  const [strategies, setStrategies] = useState<StrategyData[]>(DEMO_STRATEGIES);
  const [trades, setTrades] = useState<TradeCalculated[]>(getInitialCalculatedTrades());

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.add('light');
      } else {
        const isDarkSystem = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDarkSystem ? 'dark' : 'light');
      }
    }
  };

  const activeAccountData = accounts.find((a) => a.name === selectedAccount) || accounts[0];

  const filteredTrades = trades.filter((t) => {
    if (selectedAccount !== 'ALL' && t.account !== selectedAccount) return false;
    if (dateRange === 'ALL') return true;

    const tradeDate = new Date(t.entryTime);
    const now = new Date();

    if (dateRange === 'TODAY') {
      return tradeDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'THIS_WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return tradeDate >= startOfWeek;
    }
    if (dateRange === 'THIS_MONTH') {
      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'LAST_30_DAYS') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return tradeDate >= thirtyDaysAgo;
    }

    return true;
  });

  const startingBalance = activeAccountData ? activeAccountData.startingBalance : 10000;
  const analytics = calculateAnalyticsSummary(filteredTrades, startingBalance);

  const addAccount = (acc: AccountData) => {
    setAccounts((prev) => [...prev, acc]);
  };

  const updateAccount = (id: string, updates: Partial<AccountData>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const addStrategy = (s: StrategyData) => {
    setStrategies((prev) => [...prev, s]);
  };

  const addTrade = (tInput: any) => {
    const newTrade = calculateTradeMetrics(tInput);
    setTrades((prev) => [newTrade, ...prev]);
  };

  const updateTrade = (id: string, updates: Partial<TradeCalculated>) => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const merged: any = { ...t, ...updates };
          return calculateTradeMetrics(merged);
        }
        return t;
      })
    );
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const duplicateTrade = (id: string) => {
    const existing = trades.find((t) => t.id === id);
    if (!existing) return;
    const duplicated = calculateTradeMetrics({
      ...(existing as any),
      id: `trd-${Date.now()}`,
      entryTime: new Date().toISOString(),
    });
    setTrades((prev) => [duplicated, ...prev]);
  };

  const formatValue = (amount: number, unitOverride?: DisplayUnit, riskAmount: number = 100): string => {
    if (isPrivacyMode) return '••••••';
    const unit = unitOverride || displayUnit;

    if (unit === 'PERCENT') {
      const base = activeAccountData ? activeAccountData.startingBalance : 10000;
      const pct = (amount / base) * 100;
      return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
    }
    if (unit === 'R_MULTIPLE') {
      const r = riskAmount > 0 ? amount / riskAmount : 0;
      return `${r >= 0 ? '+' : ''}${r.toFixed(2)}R`;
    }
    return `${amount >= 0 ? '+' : ''}$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        displayUnit,
        setDisplayUnit,
        dateRange,
        setDateRange,
        selectedAccount,
        setSelectedAccount,
        isPrivacyMode,
        setIsPrivacyMode,
        setPrivacyMode: setIsPrivacyMode,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        accounts,
        activeAccountData,
        addAccount,
        updateAccount,
        deleteAccount,
        propFirms,
        strategies,
        addStrategy,
        trades,
        filteredTrades,
        analytics,
        addTrade,
        updateTrade,
        deleteTrade,
        duplicateTrade,
        formatValue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
