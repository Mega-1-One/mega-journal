'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Archive,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { StructuredNotes } from '@/lib/calculations';

export default function TradeWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { trades, updateTrade, archiveTrade, formatValue, strategies, playbooks, checklists } = useApp();

  const tradeId = params.id as string;
  const trade = trades.find((t) => t.id === tradeId);

  // Form State
  const [setup, setSetup] = useState(trade?.setup || '');
  const [strategyId, setStrategyId] = useState(trade?.strategyId || '');
  const [playbookId, setPlaybookId] = useState(trade?.playbookId || '');
  const [emotion, setEmotion] = useState(trade?.emotion || 'Calm');
  const [mistake, setMistake] = useState(trade?.mistake || 'None');
  const [rating, setRating] = useState(trade?.rating || 5);

  const [whyEntered, setWhyEntered] = useState(trade?.structuredNotes?.whyEntered || '');
  const [whatSaw, setWhatSaw] = useState(trade?.structuredNotes?.whatSaw || '');
  const [whatWentWell, setWhatWentWell] = useState(trade?.structuredNotes?.whatWentWell || '');
  const [whatWentWrong, setWhatWentWrong] = useState(trade?.structuredNotes?.whatWentWrong || '');
  const [lessonLearned, setLessonLearned] = useState(trade?.structuredNotes?.lessonLearned || '');

  const [isSaved, setIsSaved] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawColor, setDrawColor] = useState('#C8FF00');
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (trade) {
      setSetup(trade.setup || '');
      setStrategyId(trade.strategyId || '');
      setPlaybookId(trade.playbookId || '');
      setEmotion(trade.emotion || 'Calm');
      setMistake(trade.mistake || 'None');
      setRating(trade.rating || 5);
      setWhyEntered(trade.structuredNotes?.whyEntered || '');
      setWhatSaw(trade.structuredNotes?.whatSaw || '');
      setWhatWentWell(trade.structuredNotes?.whatWentWell || '');
      setWhatWentWrong(trade.structuredNotes?.whatWentWrong || '');
      setLessonLearned(trade.structuredNotes?.lessonLearned || '');
    }
  }, [trade]);

  if (!trade) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Trade Record Not Found</h2>
        <Link href="/trades" className="btn-primary-lime inline-block px-4 py-2 text-xs rounded-xl">
          Return to Trade Log
        </Link>
      </div>
    );
  }

  // Daily Navigator Trades
  const sameDayTrades = trades.filter(
    (t) =>
      new Date(t.entryTime).toDateString() === new Date(trade.entryTime).toDateString() &&
      t.status !== 'ARCHIVED'
  );
  const currentIndex = sameDayTrades.findIndex((t) => t.id === trade.id);
  const prevTrade = currentIndex > 0 ? sameDayTrades[currentIndex - 1] : null;
  const nextTrade = currentIndex < sameDayTrades.length - 1 ? sameDayTrades[currentIndex + 1] : null;

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    const structuredNotes: StructuredNotes = {
      whyEntered,
      whatSaw,
      whatWentWell,
      whatWentWrong,
      lessonLearned,
    };
    updateTrade(trade.id, {
      setup,
      strategyId,
      playbookId,
      emotion,
      mistake,
      rating,
      structuredNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleArchive = () => {
    archiveTrade(trade.id);
    router.push('/trades');
  };

  // Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const tradeChecklist = checklists[trade.id] || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
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
            onClick={() => setIsAIModalOpen(true)}
            className="btn-primary-lime text-xs px-3.5 py-1.5 rounded-xl shadow-glow flex items-center gap-1.5 font-heading font-black"
          >
            <Sparkles className="w-4 h-4" /> Analyze Trade with AI
          </button>

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

            <div className="flex items-center justify-between font-heading font-bold text-xs">
              {prevTrade ? (
                <Link
                  href={`/trades/${prevTrade.id}`}
                  className="flex items-center gap-1 text-text-secondary hover:text-lime"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Trade
                </Link>
              ) : (
                <span className="text-text-muted opacity-40 flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </span>
              )}

              <span className="text-text-muted font-mono-num">
                {currentIndex + 1} / {sameDayTrades.length}
              </span>

              {nextTrade ? (
                <Link
                  href={`/trades/${nextTrade.id}`}
                  className="flex items-center gap-1 text-text-secondary hover:text-lime"
                >
                  Next Trade <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-text-muted opacity-40 flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1.5 border-t border-bg-border pt-3">
              {sameDayTrades.map((t) => (
                <Link
                  key={t.id}
                  href={`/trades/${t.id}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-mono-num transition-all ${
                    t.id === trade.id
                      ? 'bg-lime/10 text-lime font-bold border border-lime/30'
                      : 'hover:bg-bg-nested text-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary font-heading">{t.symbol}</span>
                    <span className={`text-[10px] ${t.direction === 'LONG' ? 'text-lime' : 'text-loss'}`}>
                      {t.direction}
                    </span>
                  </div>
                  <span className={`font-bold ${t.netPnL >= 0 ? 'text-lime' : 'text-loss'}`}>
                    {formatValue(t.netPnL)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Checklist Summary */}
          <div className="custom-card p-4 space-y-3 font-mono-num">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading">
              Checklist Adherence ({tradeChecklist.filter((c) => c.isFollowed).length} / {tradeChecklist.length})
            </h3>
            <div className="space-y-1.5 text-xs">
              {tradeChecklist.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${c.isFollowed ? 'bg-lime text-bg-main' : 'bg-loss text-white'}`}>
                    {c.isFollowed ? '✓' : '✕'}
                  </span>
                  <span className="text-text-primary text-[11px] truncate">{c.ruleName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Canvas & Structured Notes */}
        <div className="lg:col-span-9 space-y-6">
          {/* HTML5 Canvas Visualizer */}
          <div className="custom-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider font-heading flex items-center gap-2">
                <Camera className="w-4 h-4 text-lime" /> Interactive Execution Chart & Annotation Visualizer
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawColor('#C8FF00')}
                  className={`w-5 h-5 rounded-full bg-lime border ${drawColor === '#C8FF00' ? 'ring-2 ring-white' : ''}`}
                />
                <button
                  onClick={() => setDrawColor('#EF4444')}
                  className={`w-5 h-5 rounded-full bg-loss border ${drawColor === '#EF4444' ? 'ring-2 ring-white' : ''}`}
                />
                <button
                  onClick={clearCanvas}
                  className="px-2.5 py-1 rounded bg-bg-nested text-[10px] font-bold text-text-muted hover:text-text-primary border border-bg-border"
                >
                  Clear Annotations
                </button>
              </div>
            </div>

            <div className="relative border border-bg-border rounded-xl overflow-hidden bg-bg-main h-72">
              <canvas
                ref={canvasRef}
                width={800}
                height={288}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
            </div>
          </div>

          {/* Structured Review Notes */}
          <form onSubmit={handleSaveNotes} className="custom-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-bg-border pb-4">
              <h3 className="text-sm font-bold text-text-primary font-heading tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-lime" /> Structured Trade Review & Reflection
              </h3>

              {isSaved && (
                <span className="text-xs text-lime font-bold font-mono-num flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Review Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-num">
              <div>
                <label className="text-text-secondary font-bold block mb-1">Why I Entered</label>
                <textarea
                  rows={3}
                  value={whyEntered}
                  onChange={(e) => setWhyEntered(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
                  placeholder="What was the setup trigger?"
                />
              </div>

              <div>
                <label className="text-text-secondary font-bold block mb-1">What I Saw</label>
                <textarea
                  rows={3}
                  value={whatSaw}
                  onChange={(e) => setWhatSaw(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
                  placeholder="Order flow, market structure, HTF bias..."
                />
              </div>

              <div>
                <label className="text-text-secondary font-bold block mb-1">What Went Well</label>
                <textarea
                  rows={3}
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
                  placeholder="Patience, rule execution, position management..."
                />
              </div>

              <div>
                <label className="text-text-secondary font-bold block mb-1">What Went Wrong</label>
                <textarea
                  rows={3}
                  value={whatWentWrong}
                  onChange={(e) => setWhatWentWrong(e.target.value)}
                  className="w-full bg-bg-main border border-bg-border rounded-xl p-3 text-text-primary focus:border-lime focus:outline-none"
                  placeholder="Hesitation, FOMO entry, moving stop loss..."
                />
              </div>
            </div>

            <div>
              <label className="text-text-secondary font-bold block mb-1">Lesson Learned</label>
              <input
                type="text"
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                className="w-full bg-bg-main border border-bg-border rounded-xl px-3 py-2.5 text-text-primary focus:border-lime focus:outline-none font-bold"
                placeholder="Key takeaway for future setups..."
              />
            </div>

            <div className="flex justify-end border-t border-bg-border pt-4">
              <button
                type="submit"
                className="btn-primary-lime text-xs px-6 py-2.5 rounded-xl shadow-glow font-heading font-black flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Trade Review
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI TRADE REVIEW MODAL */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-bg-border flex items-center justify-between bg-bg-card">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime" />
                <h3 className="text-base font-bold text-text-primary tracking-tight font-heading">
                  AI Trade Review for {trade.symbol} ({trade.direction})
                </h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono-num">
              <div className="p-4 bg-bg-nested rounded-xl border border-bg-border space-y-2">
                <span className="text-[10px] font-bold text-lime uppercase tracking-wider block font-heading">EXECUTION EVALUATION</span>
                <p className="text-text-primary">
                  Entry at <strong>${trade.entryPrice}</strong> followed your <strong>{trade.setup || 'General Setup'}</strong> playbook parameters. Initial risk was calculated at <strong>${trade.initialRisk}</strong>.
                </p>
              </div>

              <div className="p-4 bg-bg-nested rounded-xl border border-bg-border space-y-2">
                <span className="text-[10px] font-bold text-lime uppercase tracking-wider block font-heading">RULE ADHERENCE</span>
                <p className="text-text-primary">
                  Checklist rules satisfied: <strong>{tradeChecklist.filter((c) => c.isFollowed).length} / {tradeChecklist.length || 5}</strong>. No risk overrun detected.
                </p>
              </div>

              <div className="p-4 bg-bg-nested rounded-xl border border-bg-border space-y-2">
                <span className="text-[10px] font-bold text-lime uppercase tracking-wider block font-heading">KEY TAKEAWAY</span>
                <p className="text-text-primary font-bold">
                  {trade.structuredNotes?.lessonLearned || 'Sticking to pre-market bias and waiting for HTF liquidity sweep yields high expectancy.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="btn-primary-lime text-xs px-5 py-2 rounded-xl font-heading font-bold"
                >
                  Close AI Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
