'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TradeCalculated,
  AnalyticsSummary,
  AdherenceComparison,
  calculateTradeMetrics,
  calculateAnalyticsSummary,
  calculateAdherencePerformance,
} from '@/lib/calculations';
import {
  AccountData,
  PropFirmData,
  StrategyData,
  PlaybookData,
  RuleData,
  ChecklistResult,
  DEMO_ACCOUNTS,
  DEMO_PROP_FIRMS,
  DEMO_STRATEGIES,
  DEMO_PLAYBOOKS,
  DEMO_RULES,
  getInitialCalculatedTrades,
} from '@/lib/store';
import { DatePreset, isDateInPreset } from '@/lib/dates';

export type ThemeMode = 'dark' | 'light' | 'system';
export type DisplayUnit = 'DOLLAR' | 'PERCENT' | 'R_MULTIPLE' | 'PIPS';

interface AppContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;

  displayUnit: DisplayUnit;
  setDisplayUnit: (u: DisplayUnit) => void;

  datePreset: DatePreset;
  setDatePreset: (d: DatePreset) => void;

  customDateStart: string;
  setCustomDateStart: (s: string) => void;
  customDateEnd: string;
  setCustomDateEnd: (e: string) => void;

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
  updateStrategy: (id: string, updates: Partial<StrategyData>) => void;
  archiveStrategy: (id: string) => void;

  playbooks: PlaybookData[];
  addPlaybook: (pb: PlaybookData) => void;
  updatePlaybook: (id: string, updates: Partial<PlaybookData>) => void;
  archivePlaybook: (id: string) => void;

  rules: RuleData[];
  addRule: (r: RuleData) => void;

  checklists: ChecklistResult[];
  updateChecklistResult: (tradeId: string, ruleId: string, isFollowed: boolean) => void;

  trades: TradeCalculated[];
  filteredTrades: TradeCalculated[];
  analytics: AnalyticsSummary;
  adherenceComparison: AdherenceComparison;

  addTrade: (t: any) => void;
  updateTrade: (id: string, updates: Partial<TradeCalculated>) => void;
  deleteTrade: (id: string) => void;
  archiveTrade: (id: string) => void;
  duplicateTrade: (id: string) => void;

  formatValue: (amount: number, unitOverride?: DisplayUnit, riskAmount?: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [displayUnit, setDisplayUnit] = useState<DisplayUnit>('DOLLAR');
  const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [accounts, setAccounts] = useState<AccountData[]>(DEMO_ACCOUNTS);
  const [propFirms] = useState<PropFirmData[]>(DEMO_PROP_FIRMS);
  const [strategies, setStrategies] = useState<StrategyData[]>(DEMO_STRATEGIES);
  const [playbooks, setPlaybooks] = useState<PlaybookData[]>(DEMO_PLAYBOOKS);
  const [rules, setRules] = useState<RuleData[]>(DEMO_RULES);
  const [checklists, setChecklists] = useState<ChecklistResult[]>([]);
  const [trades, setTrades] = useState<TradeCalculated[]>(getInitialCalculatedTrades());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (t.status === 'ARCHIVED') return false;
    if (selectedAccount !== 'ALL' && t.account !== selectedAccount) return false;
    return isDateInPreset(t.entryTime, datePreset, customDateStart, customDateEnd);
  });

  const startingBalance = activeAccountData ? activeAccountData.startingBalance : 10000;
  const analytics = calculateAnalyticsSummary(filteredTrades, startingBalance);
  const adherenceComparison = calculateAdherencePerformance(filteredTrades);

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

  const updateStrategy = (id: string, updates: Partial<StrategyData>) => {
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const archiveStrategy = (id: string) => {
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'ARCHIVED' } : s)));
  };

  const addPlaybook = (pb: PlaybookData) => {
    setPlaybooks((prev) => [...prev, pb]);
  };

  const updatePlaybook = (id: string, updates: Partial<PlaybookData>) => {
    setPlaybooks((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const archivePlaybook = (id: string) => {
    setPlaybooks((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' } : p)));
  };

  const addRule = (r: RuleData) => {
    setRules((prev) => [...prev, r]);
  };

  const updateChecklistResult = (tradeId: string, ruleId: string, isFollowed: boolean) => {
    setChecklists((prev) => {
      const existing = prev.find((c) => c.tradeId === tradeId && c.ruleId === ruleId);
      if (existing) {
        return prev.map((c) => (c.tradeId === tradeId && c.ruleId === ruleId ? { ...c, isFollowed } : c));
      }
      return [...prev, { tradeId, ruleId, ruleName: 'Checklist Rule', category: 'SETUP', isFollowed }];
    });
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

  const archiveTrade = (id: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'ARCHIVED' } : t))
    );
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
        datePreset,
        setDatePreset,
        customDateStart,
        setCustomDateStart,
        customDateEnd,
        setCustomDateEnd,
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
        updateStrategy,
        archiveStrategy,
        playbooks,
        addPlaybook,
        updatePlaybook,
        archivePlaybook,
        rules,
        addRule,
        checklists,
        updateChecklistResult,
        trades,
        filteredTrades,
        analytics,
        adherenceComparison,
        addTrade,
        updateTrade,
        deleteTrade,
        archiveTrade,
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
