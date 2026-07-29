'use client';

import React from 'react';
import { Users, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollaboratorUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  activeChapter?: string;
}

export interface CollaborativePresenceProps {
  collaborators?: CollaboratorUser[];
  className?: string;
}

export function CollaborativePresence({ collaborators, className }: CollaborativePresenceProps) {
  const activeUsers: CollaboratorUser[] = collaborators || [
    { id: 'u-1', name: 'Dr. Elena Vance', color: '#6366f1', activeChapter: 'Chapter 1' },
    { id: 'u-2', name: 'Marcus Sterling', color: '#06b6d4', activeChapter: 'Chapter 2' },
  ];

  return (
    <div className={cn('flex items-center space-x-2 font-sans text-xs', className)}>
      <div className="flex items-center space-x-1 text-slate-400 font-medium">
        <Users className="w-3.5 h-3.5 text-indigo-400" />
        <span>Live Co-authors:</span>
      </div>

      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            title={`${user.name} (${user.activeChapter || 'Editing'})`}
            style={{ backgroundColor: user.color }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#0d1322] shadow cursor-pointer transition-transform hover:scale-110"
          >
            {user.name.charAt(0)}
          </div>
        ))}
      </div>
    </div>
  );
}
