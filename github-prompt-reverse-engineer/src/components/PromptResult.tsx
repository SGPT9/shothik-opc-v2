'use client';

import { useState } from 'react';

export default function PromptResult({ prompt, repo }: { prompt: string, repo: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">
          Synthetic Prompt for <span className="text-blue-600 font-mono text-sm">{repo}</span>
        </h3>
        <button
          onClick={handleCopy}
          className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700 font-medium"
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </div>
      <div className="p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 overflow-auto max-h-[500px]">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
