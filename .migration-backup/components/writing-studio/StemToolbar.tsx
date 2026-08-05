'use client';

import React from 'react';
import { Sigma, Code2, FlaskConical, Binary, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StemToolbarProps {
  onInsertFormula: (snippet: string) => void;
  className?: string;
}

export function StemToolbar({ onInsertFormula, className }: StemToolbarProps) {
  const snippets = [
    { label: 'Fraction', icon: Sigma, snippet: '$\\frac{a}{b}$' },
    { label: 'Square Root', icon: Sigma, snippet: '$\\sqrt{x}$' },
    { label: 'Summation', icon: Sigma, snippet: '$\\sum_{i=1}^{n} x_i$' },
    { label: 'Integral', icon: Sigma, snippet: '$\\int_{a}^{b} f(x) dx$' },
    { label: 'Python Block', icon: Code2, snippet: '\n```python\n# Data calculation\nimport numpy as np\n```\n' },
    { label: 'Chemistry', icon: FlaskConical, snippet: '$\\text{H}_2\text{O}$' },
  ];

  return (
    <div className={cn('p-2 bg-[#0d1322] border-b border-slate-800 flex items-center space-x-1 overflow-x-auto text-xs', className)}>
      <span className="text-[10px] font-mono uppercase text-slate-500 mr-2 flex items-center space-x-1">
        <Binary className="w-3 h-3 text-cyan-400" />
        <span>STEM KaTeX:</span>
      </span>

      {snippets.map((s, idx) => {
        const Icon = s.icon;
        return (
          <button
            key={idx}
            onClick={() => onInsertFormula(s.snippet)}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[11px] font-mono transition"
          >
            <Icon className="w-3 h-3 text-indigo-400" />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
