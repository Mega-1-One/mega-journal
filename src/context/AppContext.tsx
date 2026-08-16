'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TradeCalculated,
  TradeInput,
  calculateTradeMetrics,
  calculateAnalyticsSummary,
  AnalyticsSummary,
  calculateAdherencePerformance,
  AdherenceComparison,
} from '@/lib/calculations';
import {
  AccountData,
  DEMO_ACCOUNTS,
  DEMO_PROP_FIRMS,
  PropFirmData,
  getInitialCalculatedTrades,
  StrategyData,
  PlaybookData,
  RuleData,
  ChecklistResult,
  DEMO_STRATEGIES,
  DEMO_PLAYBOOKS,
  DEMO_RULES,
  DEMO_BACKTEST_SESSIONS,
} from '@/lib/store';
import { BacktestSessionData, BacktestTradeData } from '@/lib/backtestEngine';

interface AppContextType {
  // Accounts
  accounts: AccountData[];
  selectedAccount: string;
  setSelectedAccount: (name: string) => void;
  activeAccountData: AccountData | undefined;
  addAccount: (acc: AccountData) => void;
  updateAccount: (id: string, updates: Partial<AccountData>) => void;

  // Prop Firm Data
  propFirms: PropFirmData[];

  // Trades
  trades: TradeCalculated[];
  filteredTrades: TradeCalculated[];
  addTrade: (t: TradeInput, checklistResults?: ChecklistResult[]) => void;
  updateTrade: (id: string, updates: Partial<TradeInput>) => void;
  duplicateTrade: (id: string) => void;
  archiveTrade: (id: string) => void;

  // Strategies, Playbooks, Rules & Checklists
  strategies: StrategyData[];
  playbooks: PlaybookData[];
  rules: RuleData[];
  checklists: Record<string, ChecklistResult[]>;
  addStrategy: (strat: Partial<StrategyData>) => void;
  archiveStrategy: (id: string) => void;
  addPlaybook: (pb: Partial<PlaybookData>) => void;
  archivePlaybook: (id: string) => void;
  addRule: (rule: Partial<RuleData>) => void;

  // Phase 6 Backtesting Engine
  backtestSessions: BacktestSessionData[];
  addBacktestSession: (session: Partial<BacktestSessionData>) => string;
  addBacktestTrade: (sessionId: string, trade: Partial<BacktestTradeData>) => void;
  duplicateBacktestSession: (sessionId: string) => string;

  // Filters & Analytics
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  datePreset: string;
  setDatePreset: (preset: string) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  symbolFilter: string;
  setSymbolFilter: (s: string) => void;
  directionFilter: string;
  setDirectionFilter: (d: string) => void;
  winLossFilter: string;
  setWinLossFilter: (wl: string) => void;

  analytics: AnalyticsSummary;
  adherenceComparison: AdherenceComparison;
  formatValue: (val: number, isPercent?: boolean, risk?: number) => string;

  // Global Modals & UI Preferences
  isAddTradeOpen: boolean;
  setIsAddTradeOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  theme: string;
  setTheme: (t: string) => void;
  isPrivacyMode: boolean;
  setIsPrivacyMode: (p: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountData[]>(DEMO_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<string>(DEMO_ACCOUNTS[0].name);
  const [propFirms] = useState<PropFirmData[]>(DEMO_PROP_FIRMS);
  const [trades, setTrades] = useState<TradeCalculated[]>(getInitialCalculatedTrades());

  const [strategies, setStrategies] = useState<StrategyData[]>(DEMO_STRATEGIES);
  const [playbooks, setPlaybooks] = useState<PlaybookData[]>(DEMO_PLAYBOOKS);
  const [rules, setRules] = useState<RuleData[]>(DEMO_RULES);
  const [checklists, setChecklists] = useState<Record<string, ChecklistResult[]>>({});

  // Phase 6 Backtest Sessions State
  const [backtestSessions, setBacktestSessions] = useState<BacktestSessionData[]>(DEMO_BACKTEST_SESSIONS);

  // Filters & UI Preferences State
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('ALL');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [winLossFilter, setWinLossFilter] = useState('ALL');

  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Load UI preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('mj_theme');
    if (savedTheme) setTheme(savedTheme);
    const savedPrivacy = localStorage.getItem('mj_privacy');
    if (savedPrivacy === 'true') setIsPrivacyMode(true);
  }, []);

  // Sync theme to document element class (dark vs light)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('mj_theme', theme);
  }, [theme]);

  // Sync privacy mode to localStorage
  useEffect(() => {
    localStorage.setItem('mj_privacy', isPrivacyMode ? 'true' : 'false');
  }, [isPrivacyMode]);

  // Keyboard Shortcut 'N' Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())
      ) {
        e.preventDefault();
        setIsAddTradeOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeAccountData = accounts.find((a) => a.name === selectedAccount);

  const addAccount = (acc: AccountData) => {
    setAccounts((prev) => [...prev, acc]);
    setSelectedAccount(acc.name);
  };

  const updateAccount = (id: string, updates: Partial<AccountData>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const addTrade = (t: TradeInput, checklistResults?: ChecklistResult[]) => {
    const calc = calculateTradeMetrics(t);
    setTrades((prev) => [calc, ...prev]);

    if (checklistResults && checklistResults.length > 0) {
      setChecklists((prev) => ({
        ...prev,
        [calc.id]: checklistResults,
      }));
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === calc.account) {
          const newBal = acc.currentBalance + calc.netPnL;
          return { ...acc, currentBalance: newBal };
        }
        return acc;
      })
    );
  };

  const updateTrade = (id: string, updates: Partial<TradeInput>) => {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const asset = (updates.assetClass || t.assetClass) as any;
          const updatedInput = { ...t, ...updates, assetClass: asset };
          return calculateTradeMetrics(updatedInput);
        }
        return t;
      })
    );
  };

  const duplicateTrade = (id: string) => {
    const source = trades.find((t) => t.id === id);
    if (!source) return;
    const duplicatedInput: TradeInput = {
      ...source,
      id: `trd-${Date.now()}`,
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
      assetClass: source.assetClass as any,
      direction: source.direction,
    };
    const calc = calculateTradeMetrics(duplicatedInput);
    setTrades((prev) => [calc, ...prev]);
  };

  const archiveTrade = (id: string) => {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'ARCHIVED' as const } : t)));
  };

  const addStrategy = (strat: Partial<StrategyData>) => {
    const newStrat: StrategyData = {
      id: `strat-${Date.now()}`,
      name: strat.name || 'New Strategy',
      description: strat.description || '',
      market: strat.market || 'Forex',
      timeframe: strat.timeframe || '15m',
      session: strat.session || 'London',
      status: 'ACTIVE',
      winRate: 0,
      totalTrades: 0,
      netPnL: 0,
      rules: [],
    };
    setStrategies((prev) => [...prev, newStrat]);
  };

  const archiveStrategy = (id: string) => {
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'ARCHIVED' as const } : s)));
  };

  const addPlaybook = (pb: Partial<PlaybookData>) => {
    const newPb: PlaybookData = {
      id: `pb-${Date.now()}`,
      strategyId: pb.strategyId || strategies[0]?.id || 'strat-1',
      name: pb.name || 'New Playbook',
      description: pb.description || '',
      market: pb.market || 'Forex',
      symbols: pb.symbols || 'EURUSD, GBPUSD',
      sessions: pb.sessions || 'London',
      timeframes: pb.timeframes || '15m',
      entryModel: pb.entryModel || 'FVG Retracement',
      stopModel: pb.stopModel || 'Local Swing High/Low',
      targetModel: pb.targetModel || '1:2 Risk/Reward',
      minRiskReward: pb.minRiskReward || 2.0,
      status: 'ACTIVE',
      rules: [],
    };
    setPlaybooks((prev) => [...prev, newPb]);
  };

  const archivePlaybook = (id: string) => {
    setPlaybooks((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' as const } : p)));
  };

  const addRule = (rule: Partial<RuleData>) => {
    const newRule: RuleData = {
      id: `rule-${Date.now()}`,
      strategyId: rule.strategyId,
      playbookId: rule.playbookId,
      ruleName: rule.ruleName || 'New Trading Rule',
      ruleText: rule.ruleText || rule.ruleName || 'New Trading Rule',
      category: rule.category || 'PRE_TRADE',
      isRequired: rule.isRequired ?? true,
      priority: rule.priority || 1,
      streak: 0,
      status: 'ACTIVE',
    };
    setRules((prev) => [...prev, newRule]);
  };

  // Phase 6 Backtest Methods
  const addBacktestSession = (session: Partial<BacktestSessionData>): string => {
    const newId = `bt-sess-${Date.now()}`;
    const newSession: BacktestSessionData = {
      id: newId,
      name: session.name || 'New Backtest Session',
      strategyId: session.strategyId,
      playbookId: session.playbookId,
      symbol: session.symbol || 'XAUUSD',
      timeframe: session.timeframe || '15m',
      startDate: session.startDate || new Date().toISOString().substring(0, 10),
      endDate: session.endDate || new Date().toISOString().substring(0, 10),
      startingBalance: session.startingBalance || 10000,
      currentBalance: session.startingBalance || 10000,
      riskModel: session.riskModel || 'PERCENTAGE',
      riskPercentPerTrade: session.riskPercentPerTrade || 1.0,
      status: 'IN_PROGRESS',
      notes: session.notes || '',
      trades: [],
    };
    setBacktestSessions((prev) => [newSession, ...prev]);
    return newId;
  };

  const addBacktestTrade = (sessionId: string, trade: Partial<BacktestTradeData>) => {
    setBacktestSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === sessionId) {
          const tradeNetPnL = trade.netPnL || 0;
          const newBal = sess.currentBalance + tradeNetPnL;
          const newTrade: BacktestTradeData = {
            id: `bt-trd-${Date.now()}`,
            sessionId,
            symbol: trade.symbol || sess.symbol,
            direction: trade.direction || 'LONG',
            entryPrice: trade.entryPrice || 0,
            exitPrice: trade.exitPrice || 0,
            quantity: trade.quantity || 1,
            stopLoss: trade.stopLoss || 0,
            takeProfit: trade.takeProfit || 0,
            entryTime: trade.entryTime || new Date().toISOString(),
            exitTime: trade.exitTime || new Date().toISOString(),
            grossPnL: trade.grossPnL || tradeNetPnL,
            fees: trade.fees || 0,
            netPnL: tradeNetPnL,
            rMultiple: trade.rMultiple || 0,
            isWin: tradeNetPnL > 0,
            isLoss: tradeNetPnL < 0,
            mistake: trade.mistake || 'None',
            emotion: trade.emotion || 'Calm',
            notes: trade.notes || '',
          };
          return {
            ...sess,
            currentBalance: newBal,
            trades: [newTrade, ...sess.trades],
          };
        }
        return sess;
      })
    );
  };

  const duplicateBacktestSession = (sessionId: string): string => {
    const source = backtestSessions.find((s) => s.id === sessionId);
    if (!source) return '';
    const newId = `bt-sess-${Date.now()}`;
    const duplicated: BacktestSessionData = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      currentBalance: source.startingBalance,
      status: 'IN_PROGRESS',
      trades: [],
    };
    setBacktestSessions((prev) => [duplicated, ...prev]);
    return newId;
  };

  // Filter Trades
  const filteredTrades = trades.filter((t) => {
    if (t.status === 'ARCHIVED') return false;
    if (selectedAccount !== 'ALL' && t.account !== selectedAccount) return false;
    if (symbolFilter !== 'ALL' && t.symbol !== symbolFilter) return false;
    if (directionFilter !== 'ALL' && t.direction !== directionFilter) return false;
    if (winLossFilter === 'WIN' && !t.isWin) return false;
    if (winLossFilter === 'LOSS' && !t.isLoss) return false;
    if (winLossFilter === 'BE' && !t.isBreakEven) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSymbol = t.symbol.toLowerCase().includes(q);
      const matchSetup = t.setup?.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchSymbol && !matchSetup && !matchNotes && !matchTags) return false;
    }
    return true;
  });

  const analytics = calculateAnalyticsSummary(filteredTrades, activeAccountData?.startingBalance || 10000);
  const adherenceComparison = calculateAdherencePerformance(filteredTrades);

  const formatValue = (val: number, isPercent: boolean = false, risk?: number): string => {
    if (isPrivacyMode && !isPercent) return '$••••••';
    if (isPercent) return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val > 0) return `+$${formatted}`;
    if (val < 0) return `-$${formatted}`;
    return `$${formatted}`;
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        selectedAccount,
        setSelectedAccount,
        activeAccountData,
        addAccount,
        updateAccount,
        propFirms,
        trades,
        filteredTrades,
        addTrade,
        updateTrade,
        duplicateTrade,
        archiveTrade,
        strategies,
        playbooks,
        rules,
        checklists,
        addStrategy,
        archiveStrategy,
        addPlaybook,
        archivePlaybook,
        addRule,
        backtestSessions,
        addBacktestSession,
        addBacktestTrade,
        duplicateBacktestSession,
        searchQuery,
        setSearchQuery,
        datePreset,
        setDatePreset,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        symbolFilter,
        setSymbolFilter,
        directionFilter,
        setDirectionFilter,
        winLossFilter,
        setWinLossFilter,
        analytics,
        adherenceComparison,
        formatValue,
        isAddTradeOpen,
        setIsAddTradeOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        theme,
        setTheme,
        isPrivacyMode,
        setIsPrivacyMode,
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
