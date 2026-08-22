import UrlInput from '@/components/UrlInput';
import { History } from '@/components/History';
import { Sparkles, Zap, Shield, Clock } from 'lucide-react';

const FEATURES = [
  { icon: Zap, label: 'Instant analysis', desc: 'Cached results in <1s' },
  { icon: Sparkles, label: 'Claude-powered', desc: 'Deep architecture insight' },
  { icon: Shield, label: 'Public repos only', desc: 'No credentials needed' },
  { icon: Clock, label: 'History saved', desc: 'Resume any past analysis' },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="w-full max-w-3xl flex flex-col items-center text-center mb-12 animate-fade-in-up">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: 'rgba(79, 139, 255, 0.1)',
            border: '1px solid rgba(79, 139, 255, 0.25)',
            color: '#7eb3ff',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#4f8bff', boxShadow: '0 0 6px #4f8bff' }}
          />
          Powered by Claude 3.5 Sonnet
        </div>

        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-5 leading-[1.05]"
        >
          <span className="gradient-text">Reverse engineer</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>any GitHub repo</span>
        </h1>

        <p
          className="text-lg sm:text-xl max-w-lg mx-auto leading-relaxed mb-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          Paste any public repository to instantly generate the precise AI prompt
          that could rebuild it from scratch — architecture, stack, and all.
        </p>

        <UrlInput />
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up-delay-2">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="w-full max-w-3xl mt-16 animate-fade-in-up-delay-2">
        <History />
      </div>
    </div>
  );
}
