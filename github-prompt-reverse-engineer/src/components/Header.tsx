'use client';

import { useAuth } from './AuthProvider';

export function Header() {
  const { user, loading, signInWithGithub, signOut } = useAuth();

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
      <div className="font-bold text-lg text-gray-900 tracking-tight">Shothik Prompt</div>
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-md" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGithub}
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors shadow-sm font-medium"
          >
            Sign in with GitHub
          </button>
        )}
      </div>
    </header>
  );
}
