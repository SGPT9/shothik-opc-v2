import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, CheckCircle2, Lock, Unlock, Play, Plus, Sparkles, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TicketType = 'research' | 'prototype' | 'grilling' | 'task';

export interface BoardTicket {
  id?: string;
  title: string;
  type: TicketType;
  blockedBy?: string[];
  status?: 'open' | 'closed';
  resolution?: string;
}

export interface WayfinderBoardProps {
  destination?: string;
  initialTickets?: BoardTicket[];
  onLaunchGrill?: (ticketTitle: string) => void;
  className?: string;
}

const TYPE_CONFIG: Record<TicketType, { label: string; icon: string; badgeClass: string }> = {
  grilling: { label: 'HITL Grilling', icon: '🔥', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  prototype: { label: 'Throwaway Prototype', icon: '⚡', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  research: { label: 'AFK Primary Research', icon: '📚', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  task: { label: 'Autonomous Task', icon: '🤖', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

export function WayfinderBoard({
  destination = 'Complete Production Milestone',
  initialTickets = [
    { title: 'Define courier payload schema', type: 'task', status: 'closed', resolution: 'Steadfast API v2 mapped' },
    { title: 'Implement 1.85% fee bKash math', type: 'prototype', blockedBy: ['Define courier payload schema'], status: 'open' },
    { title: 'Stress-test 2GB RAM edge devices', type: 'research', blockedBy: ['Implement 1.85% fee bKash math'], status: 'open' },
  ],
  onLaunchGrill,
  className,
}: WayfinderBoardProps) {
  const [tickets, setTickets] = useState<BoardTicket[]>(
    initialTickets.map((t, idx) => ({
      id: t.id || `ticket_${idx + 1}`,
      title: t.title,
      type: t.type,
      blockedBy: t.blockedBy || [],
      status: t.status || 'open',
      resolution: t.resolution,
    }))
  );

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TicketType>('task');
  const [isAdding, setIsAdding] = useState(false);

  // Compute closed IDs and titles
  const closedSet = new Set(
    tickets
      .filter((t) => t.status === 'closed')
      .flatMap((t) => [t.id, t.title])
      .filter(Boolean)
  );

  // Unblocked frontier: open tickets whose blockers are all closed
  const frontierTickets = tickets.filter((t) => {
    if (t.status !== 'open') return false;
    return (t.blockedBy || []).every((b) => closedSet.has(b));
  });

  // Blocked tickets: open tickets with unresolved blockers
  const blockedTickets = tickets.filter((t) => {
    if (t.status !== 'open') return false;
    return (t.blockedBy || []).some((b) => !closedSet.has(b));
  });

  // Closed tickets
  const resolvedTickets = tickets.filter((t) => t.status === 'closed');

  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'closed', resolution: `Resolved at ${new Date().toLocaleTimeString()}` }
          : t
      )
    );
  };

  const handleAddTicket = () => {
    if (!newTitle.trim()) return;
    const newId = `ticket_${Date.now()}`;
    setTickets((prev) => [
      ...prev,
      {
        id: newId,
        title: newTitle.trim(),
        type: newType,
        blockedBy: [],
        status: 'open',
      },
    ]);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className={cn('bg-[#0b101b] border border-slate-800 rounded-xl p-4 text-slate-200 font-sans space-y-4 shadow-xl', className)}>
      {/* Header / Destination */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Wayfinder Decision Map</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">{destination}</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* New Ticket Form */}
      {isAdding && (
        <div className="p-3 bg-slate-900 border border-indigo-500/30 rounded-lg space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTitle.trim()) {
                e.preventDefault();
                handleAddTicket();
              }
            }}
            placeholder="Decision ticket title..."
            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-sans"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(['task', 'prototype', 'grilling', 'research'] as TicketType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewType(t)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer select-none',
                    newType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddTicket}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded cursor-pointer select-none"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Grid: Unblocked Frontier vs Blocked / Resolved */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Unblocked Frontier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Unlock className="w-3.5 h-3.5" />
              <span>Unblocked Frontier</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full font-mono">
              {frontierTickets.length} ready
            </span>
          </div>

          <div className="space-y-2">
            {frontierTickets.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Frontier clear. All active prerequisites resolved.
              </div>
            ) : (
              frontierTickets.map((ticket) => {
                const conf = TYPE_CONFIG[ticket.type];
                return (
                  <div
                    key={ticket.id}
                    className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-lg space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border', conf.badgeClass)}>
                        {conf.icon} {conf.label}
                      </span>
                      {ticket.type === 'grilling' && (
                        <button
                          type="button"
                          onClick={() => onLaunchGrill?.(ticket.title)}
                          className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer select-none"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Grill Me</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-medium text-slate-100">{ticket.title}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400">No active blockers</span>
                      <button
                        type="button"
                        onClick={() => handleResolveTicket(ticket.id!)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer select-none"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Blocked / Fog of War & Completed */}
        <div className="space-y-3">
          {/* Blocked */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Blocked Dependencies ({blockedTickets.length})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {blockedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-2 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs space-y-1 opacity-70"
                >
                  <p className="text-slate-300 font-medium">{ticket.title}</p>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>Waiting on:</span>
                    <span className="text-amber-400 font-mono">{(ticket.blockedBy || []).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolved */}
          {resolvedTickets.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resolved Milestones ({resolvedTickets.length})</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {resolvedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-1.5 bg-slate-950/60 rounded border border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400"
                  >
                    <span className="line-through">{ticket.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{ticket.resolution || 'Done'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
