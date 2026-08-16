'use client';

import React from 'react';
import { Target, Sparkles } from 'lucide-react';

export default function GoalsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight font-heading flex items-center gap-2">
          <Target className="w-5 h-5 text-lime" /> Trading Goals
        </h1>
        <p className="text-xs text-text-secondary">Define weekly profit targets and risk discipline parameters</p>
      </div>

      <div className="custom-card p-12 text-center space-y-4 max-w-2xl mx-auto border-lime/30">
        <div className="w-12 h-12 rounded-2xl bg-lime/15 text-lime border border-lime/30 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary font-heading">Advanced Goals & Targets Module</h3>
          <p className="text-xs text-text-secondary mt-1">
            This module is coming in the next phase. Core Phase 1 + Trade Log functionality is fully active.
          </p>
        </div>
      </div>
    </div>
  );
}
