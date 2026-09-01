/**
 * Agent Mention Overlay Component (Subsystem 5)
 * Triggered when user types `@` in Composer input.
 * Displays specialized ECC & DSH agent roster with instant selection.
 */

import React from 'react';
import { Bot, Shield, Code, Sparkles, Cpu, Layers, Hammer, Terminal, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentOption {
  id: string;
  handle: string;
  name: string;
  description: string;
  category: 'ecc' | 'dsh' | 'specialist';
  icon: React.ComponentType<{ className?: string }>;
}

export const AGENT_ROSTER: AgentOption[] = [
  {
    id: 'planner',
    handle: 'planner',
    name: 'Implementation Planner',
    description: 'Decomposes complex features into phased implementation plans',
    category: 'ecc',
    icon: Layers,
  },
  {
    id: 'architect',
    handle: 'architect',
    name: 'System Architect',
    description: 'Designs scalable system architecture, capability seams, & APIs',
    category: 'ecc',
    icon: Cpu,
  },
  {
    id: 'code-reviewer',
    handle: 'code-reviewer',
    name: 'Code Reviewer',
    description: 'Audits code quality, immutability, & maintainability',
    category: 'ecc',
    icon: Code,
  },
  {
    id: 'security-reviewer',
    handle: 'security-reviewer',
    name: 'Security Auditor',
    description: 'Vulnerability detection, HMAC signatures, & RLS verification',
    category: 'ecc',
    icon: Shield,
  },
  {
    id: 'dsh-bridge',
    handle: 'dsh-bridge',
    name: 'DSH Capability Auditor',
    description: 'Audits Cordis plugin trees, capability seams, & profile work',
    category: 'dsh',
    icon: Sparkles,
  },
  {
    id: 'loop-operator',
    handle: 'loop-operator',
    name: 'Loop Operator',
    description: 'Autonomous loop execution, stall monitoring, & hygiene guards',
    category: 'dsh',
    icon: Bot,
  },
  {
    id: 'tonight-engine',
    handle: 'tonight-engine',
    name: 'Tonight Engine Daemon',
    description: '24/7 autonomous batch task queue & overnight processing',
    category: 'specialist',
    icon: Terminal,
  },
  {
    id: 'tdd-guide',
    handle: 'tdd-guide',
    name: 'TDD Guide',
    description: 'Enforces test-driven development (RED -> GREEN -> REFACTOR)',
    category: 'ecc',
    icon: Hammer,
  },
];

export interface AgentMentionOverlayProps {
  filterQuery: string;
  onSelectAgent: (agent: AgentOption) => void;
  onClose: () => void;
  selectedIndex?: number;
}

export function AgentMentionOverlay({
  filterQuery,
  onSelectAgent,
  onClose,
  selectedIndex = 0,
}: AgentMentionOverlayProps) {
  const filtered = AGENT_ROSTER.filter((agent) =>
    agent.handle.toLowerCase().includes(filterQuery.toLowerCase()) ||
    agent.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute left-4 bottom-full mb-2 w-80 max-h-72 overflow-y-auto bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-1 text-xs divide-y divide-neutral-800/40">
      <div className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
        <span>Select Agent (@mention)</span>
        <span className="text-neutral-500 font-normal">{filtered.length} available</span>
      </div>

      <div className="py-1">
        {filtered.map((agent, index) => {
          const Icon = agent.icon;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectAgent(agent)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-all group",
                isSelected
                  ? "bg-purple-950/40 border border-purple-800/40 text-purple-200"
                  : "hover:bg-neutral-800/60 text-neutral-300"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md mt-0.5 transition-colors",
                agent.category === 'dsh' ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40" :
                agent.category === 'ecc' ? "bg-purple-950/60 text-purple-400 border border-purple-800/40" :
                "bg-amber-950/60 text-amber-400 border border-amber-800/40"
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-200 group-hover:text-white truncate">
                    @{agent.handle}
                  </span>
                  <span className="text-[10px] text-neutral-500 capitalize px-1.5 py-0.5 rounded bg-neutral-800/50">
                    {agent.category}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {agent.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
