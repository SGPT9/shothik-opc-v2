'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UrlInput() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Basic parsing to extract owner/repo for routing
    let owner = '';
    let repo = '';

    try {
      if (url.startsWith('http')) {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          owner = pathParts[0];
          repo = pathParts[1];
        }
      } else {
        const parts = url.split('/').filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }
    } catch (err) {
      // Ignore parse errors here, let backend handle it if needed
    }

    if (owner && repo) {
      router.push(`/${owner}/${repo}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste GitHub URL or owner/repo"
        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
        required
      />
      <button
        type="submit"
        className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
      >
        Reverse Engineer
      </button>
    </form>
  );
}
