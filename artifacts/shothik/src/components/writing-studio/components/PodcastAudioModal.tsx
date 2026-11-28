import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Radio, Play, Pause, Rss, Copy, Check, Volume2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPodcastFeedUrl } from '@/services/writing-studio.service';

export interface PodcastAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
  chapters?: Array<{ id: string; title: string; wordCount?: number }>;
}

export function PodcastAudioModal({
  isOpen,
  onClose,
  projectId,
  projectTitle = 'Untitled Audiobook',
  chapters = [],
}: PodcastAudioModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>('ep-1');
  const [waveformBars, setWaveformBars] = useState<number[]>(
    [40, 65, 80, 45, 90, 75, 60, 85, 30, 95, 70, 50, 85, 60, 40, 75]
  );

  const feedUrl = getPodcastFeedUrl(projectId);

  // Animate waveform peaks during playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setWaveformBars(
        Array.from({ length: 16 }, () => Math.floor(20 + Math.random() * 80))
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCopyFeed = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy feed URL:', err);
    }
  };

  const episodes = chapters.length > 0 ? chapters.map((ch, idx) => ({
    id: ch.id || `ep-${idx + 1}`,
    title: ch.title,
    duration: Math.max(120, Math.round((ch.wordCount || 1000) / 2.5)),
    status: 'Ready' as const,
  })) : [
    { id: 'ep-1', title: 'Chapter 1: The Quantum Horizon (Bengali Narration)', duration: 320, status: 'Ready' as const },
    { id: 'ep-2', title: 'Chapter 2: Neural Horizons & Deep Currents', duration: 410, status: 'Ready' as const },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[#0b101b] border-slate-800 text-slate-200 shadow-2xl">
        <DialogTitle className="flex items-center gap-2 text-slate-100 text-base font-semibold">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Automated Audiobook Podcast Feed & Waveform Player</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-slate-400">
          Stream chapters as an episodic audio feed compatible with Apple Podcasts, Spotify, and Podbean.
        </DialogDescription>

        <div className="space-y-4 my-2">
          {/* Waveform Player Visualizer Card */}
          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsPlaying((p) => !p)}
                  className={cn(
                    'w-9 h-9 rounded-full p-0 flex items-center justify-center transition-all',
                    isPlaying ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  )}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                </Button>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {episodes.find((e) => e.id === activeEpisodeId)?.title || 'Playing Episode'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    <span>Intel Arc dGPU Voice Engine (Bengali Neural TTS)</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                24kHz Hi-Fi
              </span>
            </div>

            {/* Pulsating 16-Bar Waveform */}
            <div className="flex items-end justify-between gap-1.5 h-12 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  style={{ height: `${isPlaying ? height : 25}%` }}
                  className={cn(
                    'flex-1 rounded-full transition-all duration-100',
                    isPlaying ? 'bg-gradient-to-t from-emerald-500 to-indigo-400' : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Podcast RSS 2.0 Feed URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Rss className="w-3 h-3 text-amber-400" /> Public Apple Podcasts RSS Feed
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleCopyFeed}
                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5 shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy RSS'}</span>
              </Button>
            </div>
          </div>

          {/* Episode List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Generated Audio Episodes ({episodes.length})
            </span>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setActiveEpisodeId(ep.id)}
                  className={cn(
                    'p-2 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors',
                    activeEpisodeId === ep.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  )}
                >
                  <span className="truncate max-w-[300px]">{ep.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {Math.floor(ep.duration / 60)}m {ep.duration % 60}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
