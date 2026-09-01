/**
 * Slash Command Overlay Component (Subsystem 9)
 * Triggered when user types `/` in Composer input.
 * Displays executable system slash commands (/goal, /schedule, /grill-me, /learn).
 */

import React from 'react';
import { Target, Calendar, MessageSquare, BookOpen, CheckCircle, Code2, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlashCommandOption {
  command: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SLASH_COMMANDS: SlashCommandOption[] = [
  {
    command: 'goal',
    label: '/goal',
    description: 'Long-running autonomous task execution mode (overnight batch)',
    icon: Target,
  },
  {
    command: 'schedule',
    label: '/schedule',
    description: 'Schedule a recurring cron job or one-shot timer alert',
    icon: Calendar,
  },
  {
    command: 'grill-me',
    label: '/grill-me',
    description: 'Interactive interview mode to resolve design decisions & specs',
    icon: MessageSquare,
  },
  {
    command: 'learn',
    label: '/learn',
    description: 'Persist current user corrections or workflow patterns as durable memory',
    icon: BookOpen,
  },
  {
    command: 'review',
    label: '/review',
    description: 'Trigger comprehensive code quality & immutability audit',
    icon: CheckCircle,
  },
  {
    command: 'security',
    label: '/security',
    description: 'Run security audit (secrets, HMAC signatures, RLS lockdown)',
    icon: ShieldAlert,
  },
  {
    command: 'dsh-seam',
    label: '/dsh-seam',
    description: 'Inspect active DSH capability seams and provider priorities',
    icon: Sparkles,
  },
];

export interface SlashCommandOverlayProps {
  filterQuery: string;
  onSelectCommand: (cmd: SlashCommandOption) => void;
  onClose: () => void;
  selectedIndex?: number;
}

export function SlashCommandOverlay({
  filterQuery,
  onSelectCommand,
  onClose,
  selectedIndex = 0,
}: SlashCommandOverlayProps) {
  const filtered = SLASH_COMMANDS.filter((cmd) =>
    cmd.command.toLowerCase().includes(filterQuery.toLowerCase()) ||
    cmd.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute left-4 bottom-full mb-2 w-80 max-h-72 overflow-y-auto bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-1 text-xs divide-y divide-neutral-800/40">
      <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
        <span>Slash Commands</span>
        <span className="text-neutral-500 font-normal">{filtered.length} shortcuts</span>
      </div>

      <div className="py-1">
        {filtered.map((cmd, index) => {
          const Icon = cmd.icon;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={cmd.command}
              type="button"
              onClick={() => onSelectCommand(cmd)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-all group",
                isSelected
                  ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-200"
                  : "hover:bg-neutral-800/60 text-neutral-300"
              )}
            >
              <div className="p-1.5 rounded-md mt-0.5 bg-neutral-800 text-cyan-400 border border-neutral-700/60">
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-semibold text-cyan-400 group-hover:text-cyan-300 font-mono">
                  {cmd.label}
                </span>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {cmd.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
