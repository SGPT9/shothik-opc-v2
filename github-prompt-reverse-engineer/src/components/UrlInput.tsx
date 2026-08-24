'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, GitFork } from 'lucide-react';

const EXAMPLE_REPOS = [
  { label: 'vercel/next.js', sublabel: 'React framework' },
  { label: 'shadcn-ui/ui', sublabel: 'Component library' },
  { label: 'trpc/trpc', sublabel: 'End-to-end typesafe APIs' },
];

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const parseRepo = (raw: string): { owner: string; repo: string } | null => {
    try {
      const input = raw.trim();
      if (input.startsWith('http')) {
        const parts = new URL(input).pathname.split('/').filter(Boolean);
        if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
      } else {
        const parts = input.split('/').filter(Boolean);
        if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
      }
    } catch {}
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRepo(url);
    if (parsed) router.push(`/${parsed.owner}/${parsed.repo}`);
  };

  const handleExample = (label: string) => {
    setUrl(label);
    const parsed = parseRepo(label);
    if (parsed) router.push(`/${parsed.owner}/${parsed.repo}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up-delay">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow ring on focus */}
        <div
          className="absolute -inset-px rounded-2xl transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, #4f8bff, #a78bfa)',
            opacity: focused ? 1 : 0,
            filter: 'blur(1px)',
          }}
        />
        <div
          className="relative flex items-center rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-bright)',
          }}
        >
          <GitFork
            className="shrink-0 ml-4 mr-2"
            style={{ color: 'var(--text-muted)', width: 18, height: 18 }}
          />
          <input
            id="repo-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="GitHub repository URL or owner/repo"
            placeholder="github.com/vercel/next.js or owner/repo"
            className="flex-1 py-4 pr-2 bg-transparent outline-none text-base placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="shrink-0 m-1.5 flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #4f8bff, #6366f1)',
              color: '#fff',
            }}
          >
            Analyze
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Example chips */}
      <div className="mt-4 flex items-center gap-2 flex-wrap animate-fade-in-up-delay-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Try:</span>
        {EXAMPLE_REPOS.map((ex) => (
          <button
            key={ex.label}
            onClick={() => handleExample(ex.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:scale-105"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <GitFork className="w-3 h-3" />
            {ex.label}
            <span style={{ color: 'var(--text-muted)' }}>· {ex.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
