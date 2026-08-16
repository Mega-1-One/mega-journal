'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { FlaskConical, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export default function BacktestingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [candleIndex, setCandleIndex] = useState(15);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [symbol, setSymbol] = useState('NAS100');
  const [timeframe, setTimeframe] = useState('15m');
  const [simulatedTrades, setSimulatedTrades] = useState<any[]>([
    { id: 'bt-1', type: 'BUY', entry: 19800, exit: 19910, lot: 1, pnl: 110, r: 2.2 },
    { id: 'bt-2', type: 'SELL', entry: 19930, exit: 19980, lot: 1, pnl: -50, r: -1.0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCandleIndex((prev) => (prev < 40 ? prev + 1 : 15));
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#111417';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#262B30';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const totalCandles = 40;
    const candleWidth = width / totalCandles - 4;
    let price = 19800;

    for (let i = 0; i < candleIndex; i++) {
      const x = (width / totalCandles) * i + 10;
      const open = price;
      const close = price + Math.sin(i * 0.7) * 25 + (i % 2 === 0 ? 12 : -15);
      const high = Math.max(open, close) + 8;
      const low = Math.min(open, close) - 8;
      price = close;

      const isGreen = close >= open;
      ctx.strokeStyle = isGreen ? '#C8FF00' : '#EF4444';
      ctx.fillStyle = isGreen ? '#C8FF00' : '#EF4444';

      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, height - (high - 19700) * 1.2);
      ctx.lineTo(x + candleWidth / 2, height - (low - 19700) * 1.2);
      ctx.stroke();

      const bodyTop = height - (Math.max(open, close) - 19700) * 1.2;
      const bodyHeight = Math.max(4, Math.abs(close - open) * 1.2);
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    }
  }, [candleIndex]);

  const handleSimulatedOrder = (type: 'BUY' | 'SELL') => {
    const pnl = type === 'BUY' ? 140 : -45;
    const r = type === 'BUY' ? 2.8 : -0.9;
    setSimulatedTrades((prev) => [
      { id: `bt-${Date.now()}`, type, entry: 19850, exit: type === 'BUY' ? 19990 : 19805, lot: 1, pnl, r },
      ...prev,
    ]);
  };

  const totalSimPnL = simulatedTrades.reduce((acc, t) => acc + t.pnl, 0);
  const simWins = simulatedTrades.filter((t) => t.pnl > 0).length;
  const simWinRate = Math.round((simWins / (simulatedTrades.length || 1)) * 100);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-lime" /> Backtesting Lab
          </h1>
          <p className="text-xs text-text-secondary">
            Replay historical price action candle-by-candle and test strategies in real time
          </p>
        </div>

        <div className="flex items-center gap-4 bg-bg-card p-3 rounded-xl border border-bg-border text-xs font-mono-num font-heading">
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block">Sim P&L</span>
            <span className={`font-black ${totalSimPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
              {totalSimPnL >= 0 ? '+' : ''}${totalSimPnL}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block">Win Rate</span>
            <span className="font-black text-lime">{simWinRate}%</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-bold uppercase block">Sim Trades</span>
            <span className="font-black text-text-primary">{simulatedTrades.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 custom-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-heading">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-bg-main border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-primary font-bold"
              >
                <option value="NAS100">NAS100 Index</option>
                <option value="XAUUSD">XAUUSD Gold</option>
                <option value="EURUSD">EURUSD Forex</option>
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-bg-main border border-bg-border rounded-lg px-3 py-1.5 text-xs text-text-secondary"
              >
                <option value="15m">15m Timeframe</option>
                <option value="5m">5m Timeframe</option>
                <option value="1h">1h Timeframe</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-bg-main p-1.5 rounded-xl border border-bg-border">
              <button
                onClick={() => setCandleIndex(10)}
                className="p-1.5 text-text-muted hover:text-text-primary rounded"
                title="Reset Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-lg font-bold transition-all ${
                  isPlaying ? 'bg-warning text-bg-main' : 'btn-primary-lime'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setCandleIndex((prev) => Math.min(40, prev + 1))}
                className="p-1.5 text-text-muted hover:text-text-primary rounded"
                title="Step Next Candle"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-transparent text-xs text-text-secondary focus:outline-none pr-1"
              >
                <option value={1500} className="bg-bg-card">0.5x Speed</option>
                <option value={1000} className="bg-bg-card">1.0x Speed</option>
                <option value={500} className="bg-bg-card">2.0x Speed</option>
              </select>
            </div>
          </div>

          <div className="w-full h-80 bg-bg-surface rounded-xl border border-bg-border overflow-hidden">
            <canvas ref={canvasRef} width={700} height={320} className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center gap-4 pt-2 font-heading">
            <button
              onClick={() => handleSimulatedOrder('BUY')}
              className="flex-1 py-3 rounded-xl btn-primary-lime font-black text-xs shadow"
            >
              SIMULATE BUY / LONG (1 Lot)
            </button>
            <button
              onClick={() => handleSimulatedOrder('SELL')}
              className="flex-1 py-3 rounded-xl bg-loss hover:opacity-90 text-white font-black text-xs shadow"
            >
              SIMULATE SELL / SHORT (1 Lot)
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 custom-card p-5 flex flex-col justify-between space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading">Simulated Session Log</h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-80 font-mono-num">
            {simulatedTrades.map((t) => (
              <div key={t.id} className="p-3 bg-bg-nested rounded-lg border border-bg-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.type === 'BUY' ? 'bg-lime/10 text-lime' : 'bg-loss/10 text-loss'}`}>
                    {t.type}
                  </span>
                  <span className="text-text-secondary">{t.entry} → {t.exit}</span>
                </div>
                <div className="text-right">
                  <span className={`font-bold block ${t.pnl >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {t.pnl >= 0 ? '+' : ''}${t.pnl}
                  </span>
                  <span className="text-[10px] text-lime block">{t.r >= 0 ? '+' : ''}{t.r}R</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
