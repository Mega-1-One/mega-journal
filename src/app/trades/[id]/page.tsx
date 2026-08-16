'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Activity,
  Save,
  Sparkles,
  Archive,
  Image as ImageIcon,
  Star,
  Edit3,
} from 'lucide-react';

export default function TradeWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { trades, updateTrade, archiveTrade, formatValue, activeAccountData } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tradeId = params.id as string;
  const trade = trades.find((t) => t.id === tradeId) || trades[0];

  const [activeTab, setActiveTab] = useState<'STATS' | 'RULES' | 'PSYCHOLOGY' | 'SCREENSHOTS'>('STATS');

  // Structured Notes State
  const [whyEntered, setWhyEntered] = useState(trade?.structuredNotes?.whyEntered || '');
  const [whatSaw, setWhatSaw] = useState(trade?.structuredNotes?.whatSaw || '');
  const [whatWentWell, setWhatWentWell] = useState(trade?.structuredNotes?.whatWentWell || '');
  const [whatWentWrong, setWhatWentWrong] = useState(trade?.structuredNotes?.whatWentWrong || '');
  const [lessonLearned, setLessonLearned] = useState(trade?.structuredNotes?.lessonLearned || '');

  // Screenshot Upload State
  const [beforeUrl, setBeforeUrl] = useState(trade?.screenshots?.before || '');
  const [entryUrl, setEntryUrl] = useState(trade?.screenshots?.entry || '');
  const [exitUrl, setExitUrl] = useState(trade?.screenshots?.exit || '');

  const [ruleChecklist, setRuleChecklist] = useState<Record<string, boolean>>({
    'Rule 1: Liquidity swept on HTF': true,
    'Rule 2: Market Structure Shift on 5m': true,
    'Rule 3: FVG 50% retracement entry': true,
    'Rule 4: Stop loss placed at structural swing': true,
    'Rule 5: Maximum 1% risk per trade': true,
  });

  useEffect(() => {
    if (trade) {
      setWhyEntered(trade.structuredNotes?.whyEntered || 'Swept liquidity into 15m Fair Value Gap.');
      setWhatSaw(trade.structuredNotes?.whatSaw || '5m Market Structure Shift with high volume displacement.');
      setWhatWentWell(trade.structuredNotes?.whatWentWell || 'Waited patiently for 50% FVG retrace entry.');
      setWhatWentWrong(trade.structuredNotes?.whatWentWrong || 'No major execution mistakes.');
      setLessonLearned(trade.structuredNotes?.lessonLearned || 'Sticking to pre-market bias yields high expectancy.');
      setBeforeUrl(trade.screenshots?.before || '');
      setEntryUrl(trade.screenshots?.entry || '');
      setExitUrl(trade.screenshots?.exit || '');
    }
  }, [trade]);

  // Canvas visualizer with Electric Lime entry line & red SL / green TP lines
  useEffect(() => {
    if (!canvasRef.current || !trade) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0B0D0F';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#262B30';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const entry = trade.entryPrice;
    const exit = trade.exitPrice;
    const sl = trade.stopLoss || entry * 0.99;
    const tp = trade.takeProfit || entry * 1.02;

    const maxPrice = Math.max(entry, exit, sl, tp) * 1.002;
    const minPrice = Math.min(entry, exit, sl, tp) * 0.998;
    const priceRange = maxPrice - minPrice || 1;

    const getY = (price: number) => height - ((price - minPrice) / priceRange) * (height - 60) - 30;

    // Price line
    ctx.strokeStyle = trade.netPnL >= 0 ? '#C8FF00' : '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const points = 20;
    for (let i = 0; i <= points; i++) {
      const x = (width / points) * i;
      const progress = i / points;
      const currentPrice = entry + (exit - entry) * progress + Math.sin(i * 0.8) * (priceRange * 0.05);
      const y = getY(currentPrice);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Entry Line (Lime)
    const entryY = getY(entry);
    ctx.strokeStyle = '#C8FF00';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, entryY);
    ctx.lineTo(width, entryY);
    ctx.stroke();
    ctx.fillStyle = '#C8FF00';
    ctx.font = '11px Space Grotesk, sans-serif';
    ctx.fillText(`ENTRY: ${entry}`, 10, entryY - 6);

    // Stop Loss Line (Red)
    const slY = getY(sl);
    ctx.strokeStyle = '#EF4444';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, slY);
    ctx.lineTo(width, slY);
    ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.fillText(`STOP LOSS: ${sl}`, 10, slY - 6);

    // Take Profit Line (Lime)
    const tpY = getY(tp);
    ctx.strokeStyle = '#C8FF00';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, tpY);
    ctx.lineTo(width, tpY);
    ctx.stroke();
    ctx.fillStyle = '#C8FF00';
    ctx.fillText(`TAKE PROFIT: ${tp}`, 10, tpY - 6);

    ctx.setLineDash([]);
  }, [trade]);

  if (!trade) return null;

  const currentTradeIdx = trades.findIndex((t) => t.id === trade.id);
  const prevTrade = trades[currentTradeIdx - 1];
  const nextTrade = trades[currentTradeIdx + 1];

  const totalRules = Object.keys(ruleChecklist).length;
  const followedRules = Object.values(ruleChecklist).filter(Boolean).length;
  const adherenceRate = Math.round((followedRules / totalRules) * 100);

  const toggleRule = (rule: string) => {
    setRuleChecklist((prev) => ({ ...prev, [rule]: !prev[rule] }));
  };

  const handleSaveStructuredNotes = () => {
    updateTrade(trade.id, {
      structuredNotes: {
        whyEntered,
        whatSaw,
        whatWentWell,
        whatWentWrong,
        lessonLearned,
      },
      screenshots: {
        before: beforeUrl,
        entry: entryUrl,
        exit: exitUrl,
      },
    });
  };

  const handleArchive = () => {
    if (confirm('Are you sure you want to soft archive this trade? It will be excluded from analytics.')) {
      archiveTrade(trade.id);
      router.push('/trades');
    }
  };

  const balanceBefore = activeAccountData ? activeAccountData.currentBalance - trade.netPnL : 10000;
  const balanceAfter = activeAccountData ? activeAccountData.currentBalance : 10000 + trade.netPnL;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between border-b border-bg-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/trades"
            className="p-2 rounded-xl bg-bg-card hover:bg-bg-nested text-text-secondary hover:text-text-primary border border-bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-text-primary tracking-tight font-heading">{trade.symbol}</h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-extrabold ${
                  trade.direction === 'LONG' ? 'bg-lime/10 text-lime border border-lime/20' : 'bg-loss/10 text-loss border border-loss/20'
                }`}
              >
                {trade.direction}
              </span>
              <span className="text-xs text-text-secondary font-mono-num">{trade.account}</span>
            </div>
            <span className="text-xs text-text-muted">{new Date(trade.entryTime).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-num">
          <button
            onClick={handleArchive}
            className="px-3 py-1.5 rounded-xl bg-loss/10 hover:bg-loss/20 text-loss border border-loss/20 text-xs font-bold font-heading flex items-center gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" /> Soft Archive
          </button>

          <span className={`text-xl font-black ${trade.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
            {formatValue(trade.netPnL, undefined, trade.initialRisk)}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-lime/10 text-lime border border-lime/20 font-bold text-xs font-heading">
            {trade.rMultiple >= 0 ? '+' : ''}{trade.rMultiple}R
          </span>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daily Navigator */}
        <div className="lg:col-span-3 space-y-4">
          <div className="custom-card p-4 space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading">Daily Navigator</h3>

            <div className="flex items-center justify-between gap-2">
              {prevTrade ? (
                <Link
                  href={`/trades/${prevTrade.id}`}
                  className="flex-1 p-2 rounded-xl bg-bg-nested border border-bg-border text-xs text-text-secondary hover:text-text-primary flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Link>
              ) : (
                <button disabled className="flex-1 p-2 rounded-xl bg-bg-nested opacity-40 text-xs text-text-muted flex items-center justify-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
              )}

              {nextTrade ? (
                <Link
                  href={`/trades/${nextTrade.id}`}
                  className="flex-1 p-2 rounded-xl bg-bg-nested border border-bg-border text-xs text-text-secondary hover:text-text-primary flex items-center justify-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button disabled className="flex-1 p-2 rounded-xl bg-bg-nested opacity-40 text-text-muted text-xs flex items-center justify-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-bg-border space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary font-medium">
                <span>Rule Adherence Score</span>
                <span className="font-bold text-lime font-mono-num">{adherenceRate}%</span>
              </div>
              <div className="w-full bg-bg-nested h-2 rounded-full overflow-hidden border border-bg-border">
                <div className="bg-lime h-full transition-all" style={{ width: `${adherenceRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Performance & Context */}
        <div className="lg:col-span-5 custom-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-bg-border pb-3 mb-4 font-heading">
              <button
                onClick={() => setActiveTab('STATS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'STATS' ? 'bg-lime text-bg-main' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setActiveTab('PSYCHOLOGY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'PSYCHOLOGY' ? 'bg-lime text-bg-main' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Psychology
              </button>
              <button
                onClick={() => setActiveTab('RULES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'RULES' ? 'bg-lime text-bg-main' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Checklist
              </button>
            </div>

            {activeTab === 'STATS' && (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono-num">
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Account</span>
                  <span className="text-xs font-bold text-text-primary block truncate">{trade.account}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Balance Impact</span>
                  <span className="text-xs font-bold text-text-primary">${balanceBefore.toLocaleString()} → ${balanceAfter.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Entry Price</span>
                  <span className="text-sm font-bold text-text-primary">{trade.entryPrice}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Exit Price</span>
                  <span className="text-sm font-bold text-text-primary">{trade.exitPrice}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Stop Loss</span>
                  <span className="text-sm font-bold text-loss">{trade.stopLoss || 'N/A'}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border">
                  <span className="text-[10px] text-text-muted font-bold uppercase block font-heading">Take Profit</span>
                  <span className="text-sm font-bold text-lime">{trade.takeProfit || 'N/A'}</span>
                </div>
              </div>
            )}

            {activeTab === 'PSYCHOLOGY' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border flex items-center justify-between">
                  <span className="text-text-muted font-heading">Emotion state</span>
                  <span className="font-bold text-lime font-heading">{trade.emotion || 'Calm'}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border flex items-center justify-between">
                  <span className="text-text-muted font-heading">Confidence rating</span>
                  <span className="font-bold text-text-primary font-mono-num">{trade.confidence || 8} / 10</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border flex items-center justify-between">
                  <span className="text-text-muted font-heading">Mistake tag</span>
                  <span className="font-bold text-warning font-heading">{trade.mistake || 'None'}</span>
                </div>
                <div className="p-3 bg-bg-nested rounded-xl border border-bg-border flex items-center justify-between">
                  <span className="text-text-muted font-heading">Overall rating</span>
                  <div className="flex items-center text-lime">
                    {Array.from({ length: trade.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-lime" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'RULES' && (
              <div className="space-y-2.5 text-xs">
                {Object.entries(ruleChecklist).map(([rule, isChecked]) => (
                  <button
                    key={rule}
                    onClick={() => toggleRule(rule)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-bg-nested border border-bg-border text-text-primary hover:border-lime/40 transition-colors text-left"
                  >
                    {isChecked ? <CheckSquare className="w-4 h-4 text-lime" /> : <Square className="w-4 h-4 text-text-muted" />}
                    <span className={isChecked ? 'line-through text-text-muted' : 'font-medium'}>{rule}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chart Visualizer */}
        <div className="lg:col-span-4 custom-card p-4 flex flex-col">
          <h3 className="text-xs font-bold text-text-primary tracking-tight mb-2 flex items-center gap-2 font-heading">
            <Activity className="w-4 h-4 text-lime" /> Execution Chart Visualizer
          </h3>
          <div className="flex-1 w-full bg-bg-surface rounded-xl border border-bg-border overflow-hidden">
            <canvas ref={canvasRef} width={380} height={240} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Structured Notes & Lessons Section */}
      <div className="custom-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-bg-border pb-3">
          <h3 className="text-sm font-bold text-text-primary tracking-tight flex items-center gap-2 font-heading">
            <Sparkles className="w-4 h-4 text-lime" /> Structured Trade Journal & Review
          </h3>
          <button
            onClick={handleSaveStructuredNotes}
            className="btn-primary-lime text-xs px-4 py-2 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Save className="w-3.5 h-3.5" /> Save Review & Notes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-text-muted font-bold block mb-1 uppercase text-[10px] font-heading">Why I Entered</label>
            <textarea
              rows={2}
              value={whyEntered}
              onChange={(e) => setWhyEntered(e.target.value)}
              placeholder="What triggered your trade entry?"
              className="w-full bg-bg-nested border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-text-muted font-bold block mb-1 uppercase text-[10px] font-heading">What I Saw</label>
            <textarea
              rows={2}
              value={whatSaw}
              onChange={(e) => setWhatSaw(e.target.value)}
              placeholder="What market structure or indicator setup was visible?"
              className="w-full bg-bg-nested border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-text-muted font-bold block mb-1 uppercase text-[10px] font-heading">What Went Well</label>
            <textarea
              rows={2}
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="What parts of your rule execution were solid?"
              className="w-full bg-bg-nested border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-text-muted font-bold block mb-1 uppercase text-[10px] font-heading">What Went Wrong</label>
            <textarea
              rows={2}
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="Any execution hesitation, early exit, or FOMO?"
              className="w-full bg-bg-nested border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none resize-none"
            />
          </div>
        </div>

        <div>
          <label className="text-text-muted font-bold block mb-1 uppercase text-[10px] font-heading">Key Lesson Learned</label>
          <input
            type="text"
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            placeholder="Single key takeaway for your trading rulebook..."
            className="w-full bg-bg-nested border border-bg-border rounded-xl p-3 text-xs text-text-primary focus:border-lime focus:outline-none font-bold"
          />
        </div>
      </div>
    </div>
  );
}
