import React, { useState, useEffect } from "react";
import {
  Radio,
  Tv,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  X,
  Vote,
  Clock,
  Send,
  Plus,
  Flame,
  ThumbsUp
} from "lucide-react";

interface StreamPollOption {
  id: string;
  label: string;
  labelBn: string;
  votes: number;
  percentage: number;
  narrativeTrajectory: string;
}

interface StreamPoll {
  pollId: string;
  question: string;
  questionBn: string;
  options: StreamPollOption[];
  totalVotes: number;
  status: "ACTIVE" | "CONCLUDED";
  secondsRemaining: number;
  winningOptionId?: string;
}

interface StreamerChatIdea {
  id: string;
  username: string;
  badge: "VIP" | "MOD" | "FOUNDER" | "SUBSCRIBER";
  avatarColor: string;
  message: string;
  suggestedAction: string;
  upvotes: number;
}

interface StreamerSessionData {
  projectId: string;
  isLive: boolean;
  platform: "twitch" | "youtube" | "kick" | "discord";
  channelName: string;
  streamTitle: string;
  viewerCount: number;
  chatVelocityMpm: number;
  activePoll: StreamPoll;
  chatHighlights: StreamerChatIdea[];
  coWritingPrompt: string;
  suggestedBranchProse: Record<string, string>;
}

interface StreamerModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptText: string;
  projectId?: string;
  onApplyBranch: (prose: string) => void;
}

export const StreamerModeModal: React.FC<StreamerModeModalProps> = ({
  isOpen,
  onClose,
  manuscriptText,
  projectId = "proj_demo_bengali",
  onApplyBranch
}) => {
  const [data, setData] = useState<StreamerSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("opt_stealth");
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(48);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // New poll inputs
  const [showNewPollForm, setShowNewPollForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOpt1, setNewOpt1] = useState("");
  const [newOpt2, setNewOpt2] = useState("");

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/streamer-mode/session`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.activePoll?.options?.length > 0) {
          setSelectedOptionId(json.activePoll.winningOptionId || json.activePoll.options[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch streamer session:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSession();
      setSecondsLeft(48);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  const handleCastVote = async (optionId: string) => {
    if (!data?.activePoll) return;
    setVotedOptionId(optionId);
    try {
      await fetch(`/api/v1/projects/${projectId}/streamer-mode/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: data.activePoll.pollId, optionId })
      });
      // Increment local count
      setData((prev) => {
        if (!prev) return prev;
        const updatedOptions = prev.activePoll.options.map((opt) =>
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        const total = updatedOptions.reduce((acc, cur) => acc + cur.votes, 0);
        return {
          ...prev,
          activePoll: {
            ...prev.activePoll,
            totalVotes: total,
            options: updatedOptions.map((opt) => ({
              ...opt,
              percentage: Math.round((opt.votes / total) * 100)
            }))
          }
        };
      });
    } catch (e) {
      console.error("Vote failed:", e);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newOpt1.trim() || !newOpt2.trim()) return;

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/streamer-mode/create-poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion,
          options: [newOpt1, newOpt2]
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.poll && data) {
          setData({ ...data, activePoll: json.poll });
          setSelectedOptionId(json.poll.options[0]?.id || "");
          setSecondsLeft(60);
          setShowNewPollForm(false);
          setNewQuestion("");
          setNewOpt1("");
          setNewOpt2("");
        }
      }
    } catch (e) {
      console.error("Failed to create poll:", e);
    }
  };

  const handleApplyProse = (proseText: string) => {
    onApplyBranch(proseText);
    setAppliedNotice("Branch inserted into manuscript!");
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  if (!isOpen) return null;

  const activeBranchProse = data?.suggestedBranchProse?.[selectedOptionId] || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Streamer Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Tv className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  🔴 LIVE
                </span>
                <h2 className="text-base font-bold text-zinc-100">
                  {data?.channelName || "Live Co-Writing Stream"}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  Capability #28
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {data?.streamTitle || "Interactive Co-Writing Stream with Live Audience Branch Voting"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {data && (
              <div className="flex items-center space-x-3 text-xs bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{data.viewerCount.toLocaleString()} viewers</span>
                </div>
                <span className="text-zinc-600">|</span>
                <div className="flex items-center space-x-1 text-zinc-400">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>{data.chatVelocityMpm} msgs/min</span>
                </div>
              </div>
            )}

            <button
              onClick={fetchSession}
              disabled={loading}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
              title="Refresh Stream State"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {appliedNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {data ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Active Poll & Branch Injection */}
              <div className="lg:col-span-2 space-y-5">
                {/* Active Poll Card */}
                <div className="bg-zinc-900/50 border border-purple-500/30 rounded-xl p-5 space-y-4 shadow-lg shadow-purple-950/20">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Vote className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                          Active Audience Poll ({data.activePoll.totalVotes.toLocaleString()} votes)
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100">
                        {data.activePoll.question}
                      </h3>
                      <p className="text-xs text-zinc-400 font-bengali">
                        {data.activePoll.questionBn}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{secondsLeft}s left</span>
                    </div>
                  </div>

                  {/* Poll Options */}
                  <div className="space-y-2.5">
                    {data.activePoll.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      const isWinning = data.activePoll.winningOptionId === opt.id;
                      const hasVoted = votedOptionId === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                            isSelected
                              ? "bg-purple-950/20 border-purple-500/60"
                              : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                          }`}
                        >
                          {/* Percentage background fill */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 opacity-15 transition-all duration-500 ${
                              isWinning ? "bg-purple-400" : "bg-zinc-500"
                            }`}
                            style={{ width: `${opt.percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center justify-between">
                            <div className="space-y-0.5 max-w-[78%]">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-xs text-zinc-100">
                                  {opt.label}
                                </span>
                                {isWinning && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                                    LEADING
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 font-bengali">{opt.labelBn}</p>
                              <p className="text-[10px] text-zinc-500 italic">
                                {opt.narrativeTrajectory}
                              </p>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <span className="text-sm font-extrabold text-purple-300">
                                  {opt.percentage}%
                                </span>
                                <span className="block text-[10px] text-zinc-500">
                                  {opt.votes} votes
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCastVote(opt.id);
                                }}
                                disabled={hasVoted}
                                className={`px-2 py-1 rounded text-xs transition flex items-center space-x-1 ${
                                  hasVoted
                                    ? "bg-purple-500 text-zinc-950 font-bold"
                                    : "bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-300"
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{hasVoted ? "Voted" : "Vote"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                    <button
                      onClick={() => setShowNewPollForm(!showNewPollForm)}
                      className="text-purple-400 hover:text-purple-300 transition flex items-center space-x-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showNewPollForm ? "Cancel New Poll" : "Launch Custom Audience Poll"}</span>
                    </button>
                    <span className="text-zinc-500 text-[11px]">
                      Live co-writing voting synchronized via WebSocket &amp; Redis Pub/Sub
                    </span>
                  </div>

                  {/* New Poll Form */}
                  {showNewPollForm && (
                    <form
                      onSubmit={handleCreatePoll}
                      className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-zinc-200">New Audience Dilemma</h4>
                      <input
                        type="text"
                        placeholder="Poll Question (e.g. Should the character open the chest?)"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Option A"
                          value={newOpt1}
                          onChange={(e) => setNewOpt1(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500"
                        />
                        <input
                          type="text"
                          placeholder="Option B"
                          value={newOpt2}
                          onChange={(e) => setNewOpt2(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Broadcast Poll to Stream</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Selected Branch Preview & 1-Click Injection */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-zinc-200">
                        Generated Narrative Branch for Selected Option
                      </h4>
                    </div>
                    {activeBranchProse && (
                      <button
                        onClick={() => handleApplyProse(activeBranchProse)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-zinc-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-purple-500/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inject into Manuscript</span>
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-bengali">
                    {activeBranchProse || "Select an option above to preview the generated prose beat."}
                  </div>
                </div>
              </div>

              {/* Right Col: Live Chat Ideas & Upvoted Sparks */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-bold text-zinc-200">
                    Live Chat Standout Ideas ({data.chatHighlights.length})
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {data.chatHighlights.map((chat) => (
                    <div
                      key={chat.id}
                      className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-2 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: chat.avatarColor }}
                          />
                          <span className="text-xs font-bold text-zinc-200">
                            {chat.username}
                          </span>
                          <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {chat.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-0.5">
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>{chat.upvotes}</span>
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 font-bengali">{chat.message}</p>

                      <div className="pt-1 border-t border-zinc-800/60 text-[11px] text-purple-300 flex items-center justify-between">
                        <span>Action: {chat.suggestedAction}</span>
                        <button
                          onClick={() => handleApplyProse(`[Chat Idea by @${chat.username}]: ${chat.message}`)}
                          className="text-[10px] text-zinc-400 hover:text-zinc-100 underline transition"
                        >
                          Use Idea
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
              <p className="text-xs">Connecting to Twitch/YouTube Co-Writing Stream...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>Interactive Twitch/YouTube Live Writing Protocol &bull; WebSocket Edge Broadcast</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreamerModeModal;
