'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';
import PromptResult from '@/components/PromptResult';
import IssueAnalysisResult from '@/components/IssueAnalysisResult';
import { ArrowLeft, GitBranch, Sparkles, GitPullRequest, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

const TABS = [
  { id: 'prompt', label: 'Architecture Prompt', icon: Sparkles },
  { id: 'issues', label: 'Issues & PRs', icon: GitPullRequest },
] as const;
type TabId = typeof TABS[number]['id'];

export default function AnalyzeRepoPage({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promptResult, setPromptResult] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>('prompt');
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    async function analyze() {
      try {
        setLoading(true);
        setError(null);

        const sessionRes = await insforge.auth.getSession();
        const token = sessionRes.data.session?.access_token;

        const res = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/functions/v1/analyze-repo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: `${owner}/${repo}` }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze repository');
        }

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await res.json();
          setPromptResult(data.prompt);
          setLoading(false);
          return;
        }

        setLoading(false);
        setPromptResult('');
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let accumulated = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            setPromptResult(accumulated);
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        setLoading(false);
      }
    }

    if (owner && repo) analyze();
  }, [owner, repo]);

  const analyzeIssues = async () => {
    if (analysisResult || loadingIssues) return;
    try {
      setLoadingIssues(true);
      setIssuesError(null);

      const sessionRes = await insforge.auth.getSession();
      const token = sessionRes.data.session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/functions/v1/analyze-issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: `${owner}/${repo}` }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze issues');
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
        setLoadingIssues(false);
        return;
      }

      setLoadingIssues(false);
      setAnalysisResult('');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setAnalysisResult(accumulated);
        }
      }
    } catch (err: any) {
      setIssuesError(err.message || 'An unknown error occurred');
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'issues') analyzeIssues();
  }, [activeTab]);

  return (
    <div className="flex-1 px-4 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-secondary)',
              }}
            >
              <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
              {owner}/{repo}
            </div>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl transition-all hover:scale-105"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-8 w-fit animate-fade-in-up-delay"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'var(--surface)' : 'transparent',
                  border: active ? '1px solid var(--border-bright)' : '1px solid transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'prompt' && (
          <>
            {loading && <LoadingState />}
            {error && (
              <div
                className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl animate-fade-in-up"
                style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.2)' }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#f87171' }}>
                      Failed to analyze repo
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
                    <button
                      onClick={() => router.push('/')}
                      className="text-sm px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Try another repository
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!loading && !error && promptResult && (
              <PromptResult prompt={promptResult} repo={`${owner}/${repo}`} />
            )}
          </>
        )}

        {activeTab === 'issues' && (
          <>
            {loadingIssues && <LoadingState />}
            {issuesError && (
              <div
                className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl animate-fade-in-up"
                style={{ background: 'rgba(248, 113, 113, 0.05)', border: '1px solid rgba(248, 113, 113, 0.2)' }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: '#f87171' }}>Failed to analyze issues</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{issuesError}</p>
                  </div>
                </div>
              </div>
            )}
            {!loadingIssues && !issuesError && analysisResult && (
              <IssueAnalysisResult analysis={analysisResult} repo={`${owner}/${repo}`} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
