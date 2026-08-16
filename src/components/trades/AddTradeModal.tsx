'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateTradeMetrics } from '@/lib/calculations';
import { X, Calculator, CheckCircle2 } from 'lucide-react';

export function AddTradeModal() {
  const { isQuickAddOpen, setIsQuickAddOpen, accounts, strategies, addTrade } = useApp();

  const [account, setAccount] = useState(accounts[0]?.name || 'MEGA1 $10K Prop Account');
  const [symbol, setSymbol] = useState('XAUUSD');
  const [assetClass, setAssetClass] = useState<'FOREX' | 'FUTURES' | 'STOCKS' | 'CRYPTO' | 'INDICES' | 'COMMODITIES'>('COMMODITIES');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState('2420.00');
  const [exitPrice, setExitPrice] = useState('2438.50');
  const [quantity, setQuantity] = useState('1.0');
  const [stopLoss, setStopLoss] = useState('2412.00');
  const [takeProfit, setTakeProfit] = useState('2440.00');
  const [commission, setCommission] = useState('7.00');
  const [fees, setFees] = useState('2.00');
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '');
  const [setup, setSetup] = useState('Liquidity Sweep FVG');
  const [session, setSession] = useState('NEW_YORK');
  const [emotion, setEmotion] = useState('Calm');
  const [mistake, setMistake] = useState('None');
  const [rating, setRating] = useState('5');
  const [notes, setNotes] = useState('');

  const livePreview = calculateTradeMetrics({
    account,
    symbol,
    assetClass,
    direction,
    entryPrice: Number(entryPrice) || 0,
    exitPrice: Number(exitPrice) || 0,
    quantity: Number(quantity) || 1,
    stopLoss: Number(stopLoss) || 0,
    takeProfit: Number(takeProfit) || 0,
    commission: Number(commission) || 0,
    fees: Number(fees) || 0,
    strategyId,
    setup,
    session,
    mistake,
    emotion,
    rating: Number(rating) || 5,
    notes,
  });

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrade({
      account,
      symbol,
      assetClass,
      direction,
      entryPrice: Number(entryPrice) || 0,
      exitPrice: Number(exitPrice) || 0,
      quantity: Number(quantity) || 1,
      stopLoss: Number(stopLoss) || undefined,
      takeProfit: Number(takeProfit) || undefined,
      totalFees: (Number(commission) || 0) + (Number(fees) || 0),
      strategyId,
      setup,
      session,
      emotion,
      mistake,
      rating: Number(rating) || 5,
      notes,
      entryTime: new Date().toISOString(),
      exitTime: new Date().toISOString(),
    });
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime/15 text-lime border border-lime/30 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary tracking-tight font-heading">Manual Trade Entry</h3>
              <p className="text-xs text-text-secondary">P&L, R-Multiple, and Risk metrics auto-calculate in real time</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-nested transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Live Preview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg-card p-4 rounded-xl border border-bg-border">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-heading">Net P&L</span>
              <span className={`text-base font-black font-mono-num font-heading ${livePreview.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                {livePreview.netPnL >= 0 ? '+' : ''}${livePreview.netPnL.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-heading">R-Multiple</span>
              <span className="text-base font-black text-lime font-mono-num font-heading">
                {livePreview.rMultiple >= 0 ? '+' : ''}{livePreview.rMultiple}R
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-heading">Initial Risk</span>
              <span className="text-base font-black text-text-primary font-mono-num font-heading">${livePreview.initialRisk}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-heading">Risk / Reward</span>
              <span className="text-base font-black text-text-secondary font-mono-num font-heading">1 : {livePreview.riskRewardRatio}</span>
            </div>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-text-secondary block mb-1">Trading Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.name} className="bg-bg-card text-text-primary">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Symbol / Pair</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. XAUUSD"
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none uppercase font-heading font-bold"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as any)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
              >
                <option value="COMMODITIES" className="bg-bg-card">Commodities (Gold, Oil)</option>
                <option value="FOREX" className="bg-bg-card">Forex</option>
                <option value="INDICES" className="bg-bg-card">Indices (NAS100, US30)</option>
                <option value="STOCKS" className="bg-bg-card">Stocks</option>
                <option value="CRYPTO" className="bg-bg-card">Crypto</option>
                <option value="FUTURES" className="bg-bg-card">Futures</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    direction === 'LONG' ? 'bg-lime text-bg-main font-heading' : 'bg-bg-card border border-bg-border text-text-muted'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    direction === 'SHORT' ? 'bg-loss text-white font-heading' : 'bg-bg-card border border-bg-border text-text-muted'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Quantity (Lots/Contracts)</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Stop Loss (SL)</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num text-loss"
              />
            </div>

            <div>
              <label className="font-semibold text-text-secondary block mb-1">Take Profit (TP)</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-text-primary focus:border-lime focus:outline-none font-mono-num text-lime"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-text-secondary block mb-1 text-xs">Trade Notes & Thesis</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you enter this position? What execution rule applied?"
              className="w-full bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:border-lime focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t border-bg-border pt-4">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-nested transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-lime text-xs px-5 py-2.5 rounded-lg shadow flex items-center gap-1.5 font-heading font-black"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Trade to MEGA1 Journal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
