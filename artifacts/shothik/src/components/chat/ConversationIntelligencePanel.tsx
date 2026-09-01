/**
 * Conversation Intelligence & Next Actions Panel (Subsystem 10)
 * 
 * Provides:
 *  - Dynamic Prompt Follow-Up Suggestions
 *  - Recommended Specialist Agents & Tools
 *  - Automatic Task Decomposition (`GoalDriver` progress visualization)
 *  - Context-Aware One-Click Quick Actions
 */

import React from 'react';
import { Sparkles, ArrowRight, Bot, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GoalState } from '@/lib/harness/goal-driver';

export interface FollowUpSuggestion {
  id: string;
  label: string;
  actionPrompt: string;
  recommendedAgent?: string;
}

export interface ConversationIntelligencePanelProps {
  suggestions: FollowUpSuggestion[];
  activeGoal?: GoalState | null;
  onSelectSuggestion: (prompt: string, agent?: string) => void;
  onCompleteSubtask?: (subtaskId: string) => void;
}

export function ConversationIntelligencePanel({
  suggestions,
  activeGoal,
  onSelectSuggestion,
  onCompleteSubtask,
}: ConversationIntelligencePanelProps) {
  if (suggestions.length === 0 && !activeGoal) return null;

  return (
    <div className="space-y-3 my-3 px-1 text-xs">
      {/* Active Goal Task Decomposition (GoalDriver) */}
      {activeGoal ? (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-purple-200 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="font-semibold">{activeGoal.title}</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300">
              {activeGoal.progressPercentage}% Completed
            </span>
          </div>

          {/* Subtasks Progress */}
          <div className="space-y-1.5 mt-2">
            {activeGoal.subtasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 text-neutral-300"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className={`h-3.5 w-3.5 ${task.done ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span className={task.done ? 'line-through text-neutral-500' : 'font-medium'}>
                    {task.title}
                  </span>
                  {task.blockedBy && task.blockedBy.length > 0 ? (
                    <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                      Blocked by {task.blockedBy.join(', ')}
                    </span>
                  ) : null}
                </div>

                {!task.done && onCompleteSubtask ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCompleteSubtask(task.id)}
                    className="h-6 px-2 text-[11px] text-purple-300 hover:bg-purple-900/40"
                  >
                    Mark Done
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Suggested Follow-Ups & Next Actions */}
      {suggestions.length > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Suggested Next Steps</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSuggestion(item.actionPrompt, item.recommendedAgent)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all text-xs group"
              >
                {item.recommendedAgent ? (
                  <span className="text-purple-400 font-mono text-[11px]">@{item.recommendedAgent}</span>
                ) : null}
                <span>{item.label}</span>
                <ChevronRight className="h-3 w-3 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
