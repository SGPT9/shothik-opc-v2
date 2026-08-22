'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { Clock, ExternalLink } from 'lucide-react';

type PromptHistory = {
  id: string;
  repo_owner: string;
  repo_name: string;
  created_at: string;
};

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function fetchHistory() {
      const { data, error } = await insforge
        .from('prompts')
        .select('id, repo_owner, repo_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    }
    
    fetchHistory();
  }, [user]);

  if (!user || loading || history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mt-16 text-left animate-fade-in-up">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Your History
      </h3>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
        {history.map(item => (
          <Link 
            key={item.id} 
            href={`/${item.repo_owner}/${item.repo_name}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
          >
            <div>
              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.repo_owner}/{item.repo_name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
