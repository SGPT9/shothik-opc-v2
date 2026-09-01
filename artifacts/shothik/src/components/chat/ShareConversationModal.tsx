/**
 * Share Conversation & Output Modal (Subsystem 8)
 * Allows users to share complete chat sessions or specific message outputs with permission control.
 */

import { useState } from 'react';
import { Share2, Copy, Check, Lock, Globe, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ShareConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTitle: string;
  conversationId: string;
  selectedMessageContent?: string;
}

export function ShareConversationModal({
  isOpen,
  onClose,
  conversationTitle,
  conversationId,
  selectedMessageContent,
}: ShareConversationModalProps) {
  const [copied, setCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'private' | 'team' | 'public'>('public');

  if (!isOpen) return null;

  const shareUrl = selectedMessageContent
    ? `https://shothikgpt.com/c/${conversationId}?excerpt=true`
    : `https://shothikgpt.com/c/${conversationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Share Conversation</h3>
              <p className="text-xs text-neutral-400">{conversationTitle}</p>
            </div>
          </div>

          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Excerpt Preview */}
        {selectedMessageContent ? (
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 max-h-24 overflow-y-auto">
            <span className="font-semibold text-neutral-300 block mb-1">Sharing Specific Output Excerpt:</span>
            <p className="italic text-neutral-400">"{selectedMessageContent.slice(0, 150)}..."</p>
          </div>
        ) : null}

        {/* Access Level Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Access Permissions</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAccessLevel('public')}
              className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                accessLevel === 'public'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>Public Link</span>
            </button>

            <button
              type="button"
              onClick={() => setAccessLevel('team')}
              className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                accessLevel === 'team'
                  ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Workspace Team</span>
            </button>

            <button
              type="button"
              onClick={() => setAccessLevel('private')}
              className={`p-3 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition-all ${
                accessLevel === 'private'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>Private</span>
            </button>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-400">Shareable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
            />
            <Button
              type="button"
              onClick={handleCopyLink}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
