'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { Clock, ChevronRight, GitFork } from 'lucide-react';

type PromptHistory = {
  id: string;
  repo_owner: string;
  repo_name: string;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchHistory() {
      const { data, error } = await insforge
        .from('prompts')
        .select('id, repo_owner, repo_name, created_at')
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) setHistory(data);
      setLoading(false);
    }

    fetchHistory();
  }, [user]);

  if (!user) return null;
  if (loading) return (
    <div className="w-full mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{ background: 'var(--surface-2)', animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
  if (history.length === 0) return null;

  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recent</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {history.map((item) => (
          <Link
            key={item.id}
            href={`/${item.repo_owner}/${item.repo_name}`}
            className="group flex flex-col justify-between p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <GitFork className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <ChevronRight
                className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <div>
              <div
                className="text-xs font-semibold leading-tight mb-1 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.repo_owner}/{item.repo_name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {timeAgo(item.created_at)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
