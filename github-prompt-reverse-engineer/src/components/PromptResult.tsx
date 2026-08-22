'use client';

import { useState } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function PromptResult({ prompt, repo }: { prompt: string; repo: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  const charCount = prompt.length;
  const isLong = prompt.split('\n').length > 30;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${repo.replace('/', '-')}-prompt.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

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
          {/* Traffic-light dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            synthetic-prompt —{' '}
            <span style={{ color: 'var(--accent)' }}>{repo}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats */}
          <span
            className="hidden sm:block text-xs px-2.5 py-1 rounded-md font-mono"
            style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
          </span>

          <button
            onClick={handleDownload}
            title="Download as .txt"
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
                : 'linear-gradient(135deg, #4f8bff, #6366f1)',
              border: copied ? '1px solid rgba(52, 211, 153, 0.4)' : 'none',
              color: copied ? '#34d399' : '#fff',
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Prompt body */}
      <div className="relative">
        <pre
          className="p-6 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono transition-all duration-500"
          style={{
            color: 'var(--text-primary)',
            maxHeight: isLong && !expanded ? '480px' : 'none',
            overflow: isLong && !expanded ? 'hidden' : 'auto',
          }}
        >
          {prompt}
        </pre>

        {/* Fade + expand button for long prompts */}
        {isLong && !expanded && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end justify-center pt-24 pb-4"
            style={{
              background: 'linear-gradient(to top, var(--surface) 60%, transparent)',
            }}
          >
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronDown className="w-4 h-4" />
              Show full prompt
            </button>
          </div>
        )}

        {isLong && expanded && (
          <div className="flex justify-center py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <ChevronUp className="w-4 h-4" />
              Collapse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
