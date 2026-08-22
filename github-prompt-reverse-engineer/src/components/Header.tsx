'use client';

import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { GitFork, LogOut, Loader2 } from 'lucide-react';

export function Header() {
  const { user, loading, signInWithGithub, signOut } = useAuth();

  return (
    <header
      className="relative z-20 flex justify-between items-center px-5 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 font-bold text-base tracking-tight transition-opacity hover:opacity-80"
        style={{ color: 'var(--text-primary)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f8bff, #a78bfa)' }}
        >
          <GitFork className="w-4 h-4 text-white" />
        </div>
        <span>PromptLens</span>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded-md"
          style={{
            background: 'rgba(79, 139, 255, 0.12)',
            color: '#7eb3ff',
            border: '1px solid rgba(79, 139, 255, 0.2)',
          }}
        >
          beta
        </span>
      </Link>

      {/* Auth */}
      <div>
        {loading ? (
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: 'var(--text-muted)' }}
          />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #4f8bff, #a78bfa)', color: '#fff' }}
              >
                {(user.email?.[0] ?? '?').toUpperCase()}
              </div>
              <span className="max-w-[140px] truncate">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <button
            id="github-signin-btn"
            onClick={signInWithGithub}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #4f8bff, #6366f1)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(79, 139, 255, 0.2)',
            }}
          >
            <GitFork className="w-4 h-4" />
            Sign in with GitHub
          </button>
        )}
      </div>
    </header>
  );
}
