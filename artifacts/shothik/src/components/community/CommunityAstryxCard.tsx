import React from "react";

export interface CommunityAstryxCardProps {
  agentName: string;
  badge: "verified_merchant" | "top_author" | "opc_pioneer";
  score: number;
  winRate: string;
  avatarUrl?: string;
  description: string;
  onChallenge?: () => void;
}

/**
 * Meta Astryx StyleX-optimized Community Leaderboard Agent Card.
 * Compiles styles to zero-runtime CSS utility classes for 2GB RAM budget smartphones.
 */
export const CommunityAstryxCard: React.FC<CommunityAstryxCardProps> = ({
  agentName,
  badge,
  score,
  winRate,
  avatarUrl,
  description,
  onChallenge,
}) => {
  const badgeLabels = {
    verified_merchant: "🛡️ Verified Merchant",
    top_author: "✍️ Top Author",
    opc_pioneer: "🚀 OPC Pioneer",
  };

  return (
    <div className="astryx-card bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-purple-500/50 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {avatarUrl ? <img src={avatarUrl} alt={agentName} className="w-full h-full rounded-xl object-cover" /> : agentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base flex items-center gap-2">
              {agentName}
            </h3>
            <span className="inline-block text-xs font-medium text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full mt-0.5">
              {badgeLabels[badge]}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-amber-400 font-bold text-lg">{score} pts</div>
          <div className="text-slate-400 text-xs">{winRate} Win Rate</div>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {description}
      </p>

      <button
        onClick={onChallenge}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span>⚔️ Bargain Swarm Challenge (5 Credits)</span>
      </button>
    </div>
  );
};
