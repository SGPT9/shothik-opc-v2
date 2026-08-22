'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';
import PromptResult from '@/components/PromptResult';
import IssueAnalysisResult from '@/components/IssueAnalysisResult';
import { ArrowLeft, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { insforge } from '@/lib/insforge';

export default function AnalyzeRepoPage({ params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promptResult, setPromptResult] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'prompt' | 'issues'>('prompt');
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
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ url: `${owner}/${repo}` })
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze repository');
        }

        const contentType = res.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // Cache hit
          const data = await res.json();
          setPromptResult(data.prompt);
          setLoading(false);
          return;
        }
        
        // Stream hit
        setLoading(false);
        setPromptResult('');
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          let accumulated = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            setPromptResult(accumulated);
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        setLoading(false);
      }
    }
    
    if (owner && repo) {
      analyze();
    }
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
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ url: `${owner}/${repo}` })
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
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setAnalysisResult(accumulated);
        }
      }
    } catch (err: any) {
      setIssuesError(err.message || 'An unknown error occurred');
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'issues') {
      analyzeIssues();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <GitBranch className="w-4 h-4 mr-2" />
          <span className="font-mono text-sm">{owner}/{repo}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-6 flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'prompt' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Architecture Prompt
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === 'issues' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Issues & PRs Analysis
        </button>
      </div>

      {activeTab === 'prompt' && (
        <>
          {loading && <LoadingState />}
          
          {error && (
            <div className="w-full max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-100 rounded-xl">
              <h3 className="text-red-800 font-semibold mb-2">Error Reverse Engineering Repo</h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Try Another Repository
              </button>
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
            <div className="w-full max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-100 rounded-xl">
              <h3 className="text-red-800 font-semibold mb-2">Error Analyzing Issues</h3>
              <p className="text-red-600 text-sm">{issuesError}</p>
            </div>
          )}

          {!loadingIssues && !issuesError && analysisResult && (
            <IssueAnalysisResult analysis={analysisResult} repo={`${owner}/${repo}`} />
          )}
        </>
      )}
    </div>
  );
}
