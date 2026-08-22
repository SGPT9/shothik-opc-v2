const STEPS = [
  'Fetching repository metadata',
  'Exploring file structure',
  'Reading README & docs',
  'Synthesizing AI prompt',
];

export default function LoadingState() {
  return (
    <div className="w-full max-w-xl mx-auto mt-16 flex flex-col items-center animate-fade-in-up">
      {/* Animated orb */}
      <div className="relative mb-10">
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #4f8bff, #a78bfa)',
            boxShadow: '0 0 40px rgba(79, 139, 255, 0.4)',
            animation: 'pulse-ring 2s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #4f8bff, #a78bfa)',
            opacity: 0.3,
            transform: 'scale(1.4)',
            filter: 'blur(8px)',
            animation: 'pulse-ring 2s ease-in-out infinite reverse',
          }}
        />
        {/* Spinning ring */}
        <div
          className="absolute -inset-3 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#4f8bff',
            borderRightColor: 'rgba(79, 139, 255, 0.3)',
            animation: 'spin-slow 1.4s linear infinite',
          }}
        />
      </div>

      <h3
        className="text-xl font-semibold mb-2 shimmer-text"
      >
        Analyzing Repository
      </h3>

      <p className="text-sm mb-10 text-center" style={{ color: 'var(--text-muted)' }}>
        Claude is reading the codebase and generating your prompt...
      </p>

      {/* Step list */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 px-5 py-3"
            style={{
              borderBottom: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            {/* Animated dots */}
            <div className="flex gap-0.5">
              {[0, 1, 2].map((j) => (
                <span
                  key={j}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--accent)',
                    animation: `typing-dot 1.4s ease-in-out ${i * 0.3 + j * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
