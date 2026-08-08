

import { useState, useEffect } from 'react';
import { Brain, Trophy, Zap } from 'lucide-react';
import { NeuralCouplingEngine, NobelImpactEngine } from '@/lib/nobel-engine';
import { cn } from '@/lib/utils';

interface NobelStatusBarProps {
  content: string;
  wordCount: number;
  charCount: number;
  toonSavings?: number;
}

export function NobelStatusBar({ 
  content, 
  wordCount, 
  charCount,
  toonSavings = 45
}: NobelStatusBarProps) {
  const [neuralScore, setNeuralScore] = useState(0);
  const [nobelScore, setNobelScore] = useState(0);

  useEffect(() => {
    if (!content) return;
    
    // Debounced analysis
    const timer = setTimeout(() => {
      const neural = NeuralCouplingEngine.quickCheck(content);
      const nobel = NobelImpactEngine.quickCheck(content);
      
      setNeuralScore(neural.score);
      setNobelScore(nobel.score);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content]);

  const getNeuralColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-zinc-400';
  };

  const getNobelColor = (score: number) => {
    if (score >= 75) return 'text-amber-500';
    if (score >= 55) return 'text-blue-500';
    return 'text-zinc-400';
  };

  return (
    <>
      <div className="h-10 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 text-sm">
        {/* Left: Basic Stats */}
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">
            {wordCount.toLocaleString()} words
          </span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {charCount.toLocaleString()} chars
          </span>
        </div>

        {/* Center: Nobel Scores */}
        <div className="flex items-center gap-6">
          {/* Neural Coupling */}
          <div className="flex items-center gap-1.5" title="Neural Coupling Score">
            <Brain className={cn("w-4 h-4", getNeuralColor(neuralScore))} />
            <span className={cn("font-medium", getNeuralColor(neuralScore))}>
              {neuralScore}
            </span>
          </div>

          {/* Nobel Impact */}
          <div className="flex items-center gap-1.5" title="Nobel Impact Score">
            <Trophy className={cn("w-4 h-4", getNobelColor(nobelScore))} />
            <span className={cn("font-medium", getNobelColor(nobelScore))}>
              {nobelScore}
            </span>
          </div>

          {/* TOON Indicator */}
          <div 
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400" 
            title={`TOON format: ${toonSavings}% token savings`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">TOON</span>
            <span className="text-xs opacity-75">{toonSavings}%</span>
          </div>
        </div>

        {/* Right: spacer to keep scores centered */}
        <div className="w-[1px]" aria-hidden="true" />
      </div>
    </>
  );
}
