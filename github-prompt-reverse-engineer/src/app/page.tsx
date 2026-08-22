import UrlInput from '@/components/UrlInput';
import { History } from '@/components/History';
import { Sparkles } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 sm:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-3xl w-full flex flex-col items-center text-center mb-12 animate-fade-in-up">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <GithubIcon className="w-8 h-8 text-gray-900" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 flex items-center justify-center gap-3">
          Reverse Engineer Repos <Sparkles className="w-8 h-8 text-blue-500" />
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Paste any public GitHub repository to instantly generate the precise, detailed AI prompt that could build it from scratch.
        </p>
      </div>

      <UrlInput />
      
      <History />
      
      <div className="mt-16 text-sm text-gray-400">
        <p>Try appending a repo path to the URL, e.g., <code className="bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-100">/vercel/next.js</code></p>
      </div>
    </main>
  );
}
