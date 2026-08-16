'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  FlaskConical,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Plus,
  ArrowRight,
  History,
  GitCompare,
  Sliders,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  DEFAULT_HISTORICAL_CANDLES,
  CandleData,
  evaluateCandleExecution,
  BacktestTradeData,
} from '@/lib/backtestEngine';

export default function BacktestLabPage() {
  const {
    strategies,
    playbooks,
    rules,
    backtestSessions,
    addBacktestSession,
    addBacktestTrade,
    formatValue,
  } = useApp();

  const [activeSessionId, setActiveSessionId] = useState(backtestSessions[0]?.id || '');
  const activeSession = backtestSessions.find((s) => s.id === activeSessionId) || backtestSessions[0];

  // Replay State Machine
  const [candles] = useState<CandleData[]>(DEFAULT_HISTORICAL_CANDLES);
  const [currentCandleIndex, setCurrentCandleIndex] = useState(4); // Start at candle 5 to show initial trend
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);

  // Order Panel Inputs
  const currentCandle = candles[currentCandleIndex] || candles[candles.length - 1];
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState(String(currentCandle.close));
  const [stopLoss, setStopLoss] = useState(String(currentCandle.close * 0.99));
  const [takeProfit, setTakeProfit] = useState(String(currentCandle.close * 1.02));
  const [quantity, setQuantity] = useState('1.0');

  // Sync entry price when candle steps
  useEffect(() => {
    if (currentCandle) {
      setEntryPrice(String(currentCandle.close));
      if (direction === 'LONG') {
        setStopLoss((currentCandle.close * 0.99).toFixed(2));
        setTakeProfit((currentCandle.close * 1.02).toFixed(2));
      } else {
        setStopLoss((currentCandle.close * 1.01).toFixed(2));
        setTakeProfit((currentCandle.close * 0.98).toFixed(2));
      }
    }
  }, [currentCandleIndex, direction]);

  // Replay Auto-Play Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentCandleIndex((prev) => {
          if (prev >= candles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replaySpeed, candles.length]);

  const visibleCandles = candles.slice(0, currentCandleIndex + 1);

  const handleStepForward = () => {
    if (currentCandleIndex < candles.length - 1) {
      setCurrentCandleIndex((prev) => prev + 1);
    }
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setCurrentCandleIndex(4);
  };

  const handleExecuteSimulatedTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    const entry = Number(entryPrice) || currentCandle.close;
    const sl = Number(stopLoss) || (direction === 'LONG' ? entry * 0.99 : entry * 1.01);
    const tp = Number(takeProfit) || (direction === 'LONG' ? entry * 1.02 : entry * 0.98);
    const qty = Number(quantity) || 1.0;

    // Evaluate against next candle
    const nextCandle = candles[currentCandleIndex + 1] || currentCandle;
    const evalRes = evaluateCandleExecution(direction, entry, sl, tp, qty, nextCandle);

    addBacktestTrade(activeSession.id, {
      symbol: activeSession.symbol,
      direction,
      entryPrice: entry,
      exitPrice: evalRes.exitPrice,
      quantity: qty,
      stopLoss: sl,
      takeProfit: tp,
      entryTime: currentCandle.timestamp,
      exitTime: nextCandle.timestamp,
      grossPnL: evalRes.netPnL,
      netPnL: evalRes.netPnL,
      rMultiple: evalRes.rMultiple,
      isWin: evalRes.netPnL > 0,
      isLoss: evalRes.netPnL < 0,
      mistake: 'None',
      emotion: 'Calm',
      notes: `Simulated ${direction} trade executed during replay.`,
    });

    // Step candle forward after order execution
    handleStepForward();
  };

  // High/Low min max for SVG Canvas chart scaling
  const maxPrice = Math.max(...visibleCandles.map((c) => c.high));
  const minPrice = Math.min(...visibleCandles.map((c) => c.low));
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-lime" /> Backtesting Lab & Historical Replay
          </h1>
          <p className="text-xs text-text-secondary">
            Replay historical price action candle-by-candle without revealing future price data.
          </p>
        </div>

        <div className="flex items-center gap-3 font-heading font-bold text-xs">
          <Link href="/backtest/history" className="btn-secondary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <History className="w-4 h-4 text-lime" />
            <span>Session History</span>
          </Link>
          <Link href="/backtest/compare" className="btn-secondary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-lime" />
            <span>Backtest vs Live</span>
          </Link>
          <Link href="/backtest/import" className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-black">
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>Import CSV Candles</span>
          </Link>
        </div>
      </div>

      {/* REPLAY CONTROL TOOLBAR */}
      <div className="custom-card p-4 flex flex-wrap items-center justify-between gap-4 font-heading">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              isPlaying ? 'bg-warning text-bg-main' : 'bg-lime text-bg-main shadow-glow'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause Replay' : 'Start Replay'}</span>
          </button>

          <button
            onClick={handleStepForward}
            className="p-2 rounded-xl bg-bg-nested hover:bg-bg-card border border-bg-border text-text-primary"
            title="Step 1 Candle Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetReplay}
            className="p-2 rounded-xl bg-bg-nested hover:bg-bg-card border border-bg-border text-text-muted hover:text-text-primary"
            title="Reset Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted font-bold mr-1">Speed:</span>
          {[0.5, 1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => setReplaySpeed(spd)}
              className={`px-2.5 py-1 rounded-lg font-mono-num font-bold text-[11px] transition-all ${
                replaySpeed === spd ? 'bg-lime text-bg-main' : 'bg-bg-nested text-text-secondary hover:text-text-primary'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Replay Candle Counter */}
        <div className="text-xs font-mono-num text-text-muted">
          Candle <strong className="text-lime">{currentCandleIndex + 1}</strong> / {candles.length} ({currentCandle?.timestamp})
        </div>
      </div>

      {/* MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER: CANDLESTICK REPLAY CHART */}
        <div className="lg:col-span-8 custom-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-text-primary font-heading tracking-tight">{activeSession?.symbol || 'XAUUSD'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime/10 text-lime font-mono-num">
                {activeSession?.timeframe || '15m'} REPLAY
              </span>
            </div>
            <span className="text-xs text-text-muted font-mono-num">
              Price: <strong className="text-lime">${currentCandle?.close.toFixed(2)}</strong>
            </span>
          </div>

          {/* SVG CANDLESTICK CANVAS */}
          <div className="h-80 w-full bg-bg-main rounded-xl border border-bg-border p-4 relative overflow-hidden flex items-end">
            <svg className="w-full h-full overflow-visible">
              {visibleCandles.map((c, idx) => {
                const x = (idx / (visibleCandles.length || 1)) * 100 + 2;
                const isGreen = c.close >= c.open;
                const highY = 100 - ((c.high - minPrice) / priceRange) * 80 - 10;
                const lowY = 100 - ((c.low - minPrice) / priceRange) * 80 - 10;
                const openY = 100 - ((c.open - minPrice) / priceRange) * 80 - 10;
                const closeY = 100 - ((c.close - minPrice) / priceRange) * 80 - 10;

                const topY = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(closeY - openY));

                return (
                  <g key={idx}>
                    {/* Wick */}
                    <line x1={`${x}%`} y1={`${highY}%`} x2={`${x}%`} y2={`${lowY}%`} stroke={isGreen ? '#C8FF00' : '#EF4444'} strokeWidth="1.5" />
                    {/* Body */}
                    <rect
                      x={`calc(${x}% - 6px)`}
                      y={`${topY}%`}
                      width="12"
                      height={`${bodyHeight}%`}
                      fill={isGreen ? '#C8FF00' : '#EF4444'}
                      rx="2"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* RIGHT: SIMULATED ORDER PANEL */}
        <div className="lg:col-span-4 custom-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Simulated Order Entry</h3>

          <form onSubmit={handleExecuteSimulatedTrade} className="space-y-4 text-xs font-mono-num">
            {/* Direction Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('LONG')}
                className={`py-2 rounded-xl font-bold font-heading transition-all ${
                  direction === 'LONG' ? 'bg-lime text-bg-main shadow-glow' : 'bg-bg-nested text-text-muted'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('SHORT')}
                className={`py-2 rounded-xl font-bold font-heading transition-all ${
                  direction === 'SHORT' ? 'bg-loss text-white' : 'bg-bg-nested text-text-muted'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-text-primary focus:border-lime focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Stop Loss (SL)</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-loss font-bold focus:border-lime focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Take Profit (TP)</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2 text-lime font-bold focus:border-lime focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary-lime py-3 rounded-xl shadow-glow font-heading font-black text-xs uppercase tracking-wider"
            >
              Execute Backtest {direction} Trade
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM: BACKTEST TRADES LOG */}
      <div className="custom-card p-6 space-y-4 font-mono-num">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">
          Simulated Backtest Trades Log ({activeSession?.trades.length || 0})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-bg-border text-text-muted uppercase text-[10px] font-heading font-bold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Entry</th>
                <th className="py-2.5 px-3">Exit</th>
                <th className="py-2.5 px-3">R-Multiple</th>
                <th className="py-2.5 px-3 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {activeSession?.trades.map((t) => (
                <tr key={t.id} className="hover:bg-bg-nested transition-colors">
                  <td className="py-3 px-3 text-text-muted">{t.entryTime}</td>
                  <td className="py-3 px-3 font-bold text-text-primary font-heading">{t.symbol}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${t.direction === 'LONG' ? 'text-lime bg-lime/10' : 'text-loss bg-loss/10'}`}>
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-text-secondary">${t.entryPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-text-secondary">${t.exitPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 font-bold text-lime">+{t.rMultiple}R</td>
                  <td className={`py-3 px-3 text-right font-bold ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(t.netPnL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
