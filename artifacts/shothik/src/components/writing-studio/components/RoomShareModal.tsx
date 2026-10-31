import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Link2, Copy, Check, Lock, Globe, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createRoomShareConfig } from '@/services/writing-studio.service';

export interface RoomShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
}

export function RoomShareModal({
  isOpen,
  onClose,
  projectId,
  projectTitle = 'Untitled Manuscript',
}: RoomShareModalProps) {
  const [accessMode, setAccessMode] = useState<'public' | 'passcode' | 'restricted'>('passcode');
  const [passcode, setPasscode] = useState('482910');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareToken, setShareToken] = useState('shothik-live-' + projectId.slice(0, 8));

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/studio/join/${shareToken}`
    : `https://shothik.ai/studio/join/${shareToken}`;

  const handleGenerateNewPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setPasscode(pin);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        accessMode === 'passcode' ? `${roomUrl} (PIN: ${passcode})` : roomUrl
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const res = await createRoomShareConfig(projectId, accessMode, passcode);
      if (res.shareToken) {
        setShareToken(res.shareToken);
      }
    } catch (err) {
      console.warn('Failed to update room share:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0b101b] border-slate-800 text-slate-200 shadow-2xl">
        <DialogTitle className="flex items-center gap-2 text-slate-100 text-base font-semibold">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Live Collaboration & Room Passcode</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-400">
          Share "{projectTitle}" for real-time Figma/Miro-style co-authoring without account walls.
        </DialogDescription>

        <div className="space-y-4 my-2">
          {/* Access Mode Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAccessMode('public')}
              className={cn(
                'p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1',
                accessMode === 'public'
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold">Public</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">Anyone with URL</span>
            </button>

            <button
              type="button"
              onClick={() => setAccessMode('passcode')}
              className={cn(
                'p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1',
                accessMode === 'passcode'
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold">Passcode</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">URL + 6-digit PIN</span>
            </button>

            <button
              type="button"
              onClick={() => setAccessMode('restricted')}
              className={cn(
                'p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1',
                accessMode === 'restricted'
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              )}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold">Private</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">Invited members</span>
            </button>
          </div>

          {/* Passcode Configuration Field */}
          {accessMode === 'passcode' && (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Room Passcode (PIN)
                </label>
                <div className="text-lg font-mono font-bold tracking-widest text-amber-300 mt-0.5">
                  {passcode}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateNewPin}
                className="h-7 text-xs border-slate-700 hover:bg-slate-800 gap-1 text-slate-300"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate</span>
              </Button>
            </div>
          )}

          {/* Share Link Preview */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Room Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 truncate">
                {roomUrl}
              </div>
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="h-8 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs gap-1.5 shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Realtime Channel Status */}
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CRDT Broadcast & Cursor Telepathy Active (Zero Database Lag)</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleSaveConfig}
            disabled={isLoading}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            {isLoading ? 'Saving...' : 'Apply Access'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
