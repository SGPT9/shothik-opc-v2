'use client';

import { useState } from 'react';
import { Copy, Check, Download, GitPullRequest, AlertCircle } from 'lucide-react';

export default function IssueAnalysisResult({
  analysis,
  repo,
}: {
  analysis: string;
  repo: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([analysis], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${repo.replace('/', '-')}-issues-analysis.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Rough section count from markdown headers
  const sections = (analysis.match(/^#+\s/gm) || []).length;
  const wordCount = analysis.split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="w-full max-w-4xl mx-auto mt-8 rounded-2xl overflow-hidden animate-fade-in-up"
      style={{ border: '1px solid var(--border-bright)', background: 'var(--surface)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
            <AlertCircle className="w-4 h-4" style={{ color: '#f87171' }} />
          </div>
          <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            issues-analysis —{' '}
            <span style={{ color: 'var(--accent-2)' }}>{repo}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sections > 0 && (
            <span
              className="hidden sm:block text-xs px-2.5 py-1 rounded-md font-mono"
              style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              {sections} sections · {wordCount.toLocaleString()} words
            </span>
          )}

          <button
            onClick={handleDownload}
            title="Download analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: copied
                ? 'rgba(52, 211, 153, 0.15)'
                : 'linear-gradient(135deg, #a78bfa, #6366f1)',
              border: copied ? '1px solid rgba(52, 211, 153, 0.4)' : 'none',
              color: copied ? '#34d399' : '#fff',
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <pre
          className="whitespace-pre-wrap text-sm leading-relaxed font-mono overflow-auto max-h-[600px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {analysis}
        </pre>
      </div>
    </div>
  );
}
