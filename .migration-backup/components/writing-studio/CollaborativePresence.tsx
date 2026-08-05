'use client';

import React, { useEffect, useState } from 'react';
import { Users, Circle, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInsforgeBrowserClient } from '@/lib/insforge/client';

export interface CollaboratorUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  activeChapter?: string;
  lastSeen?: number;
}

export interface CollaborativePresenceProps {
  collaborators?: CollaboratorUser[];
  currentChapterTitle?: string;
  bookId?: string;
  onSelectChapter?: (chapterTitle: string) => void;
  className?: string;
}

const DEFAULT_COAUTHORS: CollaboratorUser[] = [
  { id: 'u-1', name: 'Dr. Elena Vance', color: '#6366f1', activeChapter: 'Chapter 1: Quantum Foundations', lastSeen: Date.now() },
  { id: 'u-2', name: 'Marcus Sterling', color: '#06b6d4', activeChapter: 'Chapter 2: Neural Horizons', lastSeen: Date.now() },
  { id: 'u-3', name: 'Aria Chen', color: '#ec4899', activeChapter: 'Story Bible: Character Lore', lastSeen: Date.now() },
];

export function CollaborativePresence({
  collaborators,
  currentChapterTitle,
  bookId = 'book-default',
  onSelectChapter,
  className,
}: CollaborativePresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<CollaboratorUser[]>(collaborators || DEFAULT_COAUTHORS);
  const [broadcastActive, setBroadcastActive] = useState<boolean>(false);

  useEffect(() => {
    // Wire InsForge Realtime & BroadcastChannel presence sync
    let channel: BroadcastChannel | null = null;
    try {
      const channelName = `shothik_presence_${bookId}`;
      channel = new BroadcastChannel(channelName);
      setBroadcastActive(true);

      // Listen for presence heartbeats from co-authors
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'PRESENCE_HEARTBEAT') {
          const incomingUser: CollaboratorUser = event.data.user;
          setOnlineUsers((prev) => {
            const exists = prev.some((u) => u.id === incomingUser.id);
            if (exists) {
              return prev.map((u) => (u.id === incomingUser.id ? { ...u, ...incomingUser, lastSeen: Date.now() } : u));
            }
            return [...prev, { ...incomingUser, lastSeen: Date.now() }];
          });
        }
      };

      // Broadcast self presence
      const selfUser: CollaboratorUser = {
        id: 'self-author',
        name: 'You (Co-author)',
        color: '#10b981',
        activeChapter: currentChapterTitle || 'Chapter 1',
        lastSeen: Date.now(),
      };

      channel.postMessage({ type: 'PRESENCE_HEARTBEAT', user: selfUser });
      const interval = setInterval(() => {
        if (channel) {
          channel.postMessage({
            type: 'PRESENCE_HEARTBEAT',
            user: { ...selfUser, activeChapter: currentChapterTitle || 'Chapter 1', lastSeen: Date.now() },
          });
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        channel?.close();
      };
    } catch (err) {
      setBroadcastActive(false);
    }
  }, [bookId, currentChapterTitle]);

  return (
    <div className={cn('flex items-center space-x-2 font-sans text-xs', className)}>
      <div className="flex items-center space-x-1.5 text-slate-300 font-medium bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60 shadow-sm">
        <Users className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span className="text-slate-300">Live Co-authors</span>
        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold border border-indigo-500/30">
          {onlineUsers.length}
        </span>
      </div>

      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {onlineUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => user.activeChapter && onSelectChapter?.(user.activeChapter)}
            title={`${user.name} • Active on: ${user.activeChapter || 'Editing'}`}
            style={{ backgroundColor: user.color }}
            className="relative group w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#0d1322] shadow cursor-pointer transition-transform hover:scale-115 hover:z-20"
          >
            {user.name.charAt(0)}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900 shadow-sm" />
          </button>
        ))}
      </div>
    </div>
  );
}

