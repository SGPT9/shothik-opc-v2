import React, { useState, useEffect } from "react";
import { Layers, X, Pause, Play, Clock, ArrowRight, CornerDownRight } from "lucide-react";
import { globalConversationQueue, type QueueState, type QueuedMessage } from "../../lib/conversation-queue";

export const ConversationQueuePill: React.FC = () => {
  const [queueState, setQueueState] = useState<QueueState>(globalConversationQueue.getSnapshot());

  useEffect(() => {
    const unsubscribe = globalConversationQueue.subscribe((state) => {
      setQueueState({ ...state });
    });
    return unsubscribe;
  }, []);

  if (queueState.pending.length === 0 && !queueState.running) {
    return null;
  }

  return (
    <div className="mb-2.5 mx-2 p-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md text-xs text-slate-200 transition-all animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            Follow-up Queue
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 font-mono text-[10px]">
              {queueState.pending.length} pending
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {queueState.paused ? (
            <button
              onClick={() => globalConversationQueue.resume()}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition text-[11px]"
            >
              <Play className="w-3 h-3" /> Resume
            </button>
          ) : (
            <button
              onClick={() => globalConversationQueue.pause()}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition text-[11px]"
            >
              <Pause className="w-3 h-3" /> Pause
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
        {queueState.pending.map((msg, idx) => (
          <div
            key={msg.id}
            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px]"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-slate-500 font-mono shrink-0">#{idx + 1}</span>
              <span className="text-slate-300 truncate">{msg.text}</span>
            </div>
            <button
              onClick={() => globalConversationQueue.remove(msg.id)}
              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
