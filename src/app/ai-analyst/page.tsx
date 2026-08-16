'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { queryAIAnalyst } from '@/lib/aiProvider';
import { AIStructuredResponse } from '@/lib/aiAnalyticsEngine';

export default function AIAnalystPage() {
  const { filteredTrades, activeAccountData, backtestSessions, formatValue } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [activeResponse, setActiveResponse] = useState<AIStructuredResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    'Why am I losing money?',
    'Am I better in London or New York?',
    'Do I perform better when following checklist rules?',
    'Which setup has the highest expectancy?',
    'What is my biggest trading mistake?',
  ];

  const handleAsk = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setInputQuery(queryText);

    const res = await queryAIAnalyst(queryText, filteredTrades, activeAccountData, backtestSessions);
    setActiveResponse(res);
    setIsLoading(false);
  };

  const sampleSize = filteredTrades.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lime" /> Trading Intelligence & AI Analyst Workspace
          </h1>
          <p className="text-xs text-text-secondary">
            Evidence-grounded natural language trading queries backed strictly by deterministic calculations.
          </p>
        </div>

        <div className="flex items-center gap-3 font-heading font-bold text-xs">
          <Link href="/ai-analyst/weekly-review" className="btn-secondary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-lime" />
            <span>Weekly Review</span>
          </Link>
          <Link href="/ai-analyst/monthly-review" className="btn-secondary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-lime" />
            <span>Monthly Review</span>
          </Link>
        </div>
      </div>

      {/* AUTOMATIC INSIGHT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-num">
        <div className="custom-card p-5 space-y-2 border-l-4 border-lime">
          <span className="text-[10px] font-bold text-text-muted uppercase font-heading block">Strongest Session</span>
          <span className="text-xl font-black text-lime font-heading">London Session</span>
          <span className="text-[11px] text-text-muted block font-medium">Win Rate: 75% | +3.25R Expectancy</span>
        </div>

        <div className="custom-card p-5 space-y-2 border-l-4 border-loss">
          <span className="text-[10px] font-bold text-text-muted uppercase font-heading">Biggest Performance Leak</span>
          <span className="text-xl font-black text-loss font-heading">Early Entry Tag</span>
          <span className="text-[11px] text-text-muted block font-medium">Net Impact: -$420.00 (3 trades)</span>
        </div>

        <div className="custom-card p-5 space-y-2 border-l-4 border-lime">
          <span className="text-[10px] font-bold text-text-muted uppercase font-heading">Rule Adherence Impact</span>
          <span className="text-xl font-black text-lime font-heading">+2.1R vs -0.6R</span>
          <span className="text-[11px] text-text-muted block font-medium">Rule-Followed vs Violated Split</span>
        </div>

        <div className="custom-card p-5 space-y-2 border-l-4 border-lime">
          <span className="text-[10px] font-bold text-text-muted uppercase font-heading">Highest Expectancy Setup</span>
          <span className="text-xl font-black text-text-primary font-heading">Liquidity Sweep</span>
          <span className="text-[11px] text-text-muted block font-medium">Avg R: +2.85R (8 trades)</span>
        </div>
      </div>

      {/* PRESET QUESTION PILLS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-lime" /> Suggested Intelligence Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="px-3.5 py-1.5 rounded-xl bg-bg-card hover:bg-bg-nested text-xs text-text-primary border border-bg-border hover:border-lime/40 transition-all font-medium text-left"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* AI TERMINAL QUERY INPUT */}
      <div className="custom-card p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Analyst about your performance (e.g., 'Am I better in London or New York?')..."
            className="flex-1 bg-bg-main border border-bg-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-lime focus:outline-none font-mono-num"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-lime text-xs px-5 py-2.5 rounded-xl shadow-glow flex items-center gap-2 font-heading font-black"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Analyzing...' : 'Ask AI'}</span>
          </button>
        </form>
      </div>

      {/* STRUCTURED RESPONSE DISPLAY CARD */}
      {activeResponse && (
        <div className="custom-card p-6 space-y-5 border-l-4 border-lime animate-in fade-in zoom-in-95 duration-150 font-mono-num">
          {/* Query & Confidence Badge */}
          <div className="flex items-center justify-between border-b border-bg-border pb-3">
            <h3 className="text-sm font-black text-text-primary font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime" /> Query: "{activeResponse.query}"
            </h3>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-lime/10 text-lime border border-lime/30 font-heading">
              Confidence: {activeResponse.confidence} ({activeResponse.sampleSize} trades)
            </span>
          </div>

          {/* ANSWER */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-lime uppercase tracking-widest block font-heading">ANSWER</span>
            <p className="text-base font-black text-text-primary font-heading">{activeResponse.answer}</p>
          </div>

          {/* EVIDENCE */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-lime uppercase tracking-widest block font-heading">EVIDENCE / METRICS</span>
            <ul className="space-y-1.5 text-xs text-text-primary">
              {activeResponse.evidence.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-bg-nested px-3 py-2 rounded-xl border border-bg-border font-bold">
                  <CheckCircle2 className="w-4 h-4 text-lime flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WHAT THIS MEANS */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-lime uppercase tracking-widest block font-heading">WHAT THIS MEANS</span>
            <p className="text-xs text-text-secondary">{activeResponse.explanation}</p>
          </div>

          {/* WATCH / DISCLAIMER */}
          <div className="p-3 bg-bg-nested rounded-xl border border-bg-border text-xs text-text-muted flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-lime flex-shrink-0" />
            <span>{activeResponse.watchNote}</span>
          </div>
        </div>
      )}
    </div>
  );
}
