"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  GitMerge,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  Send,
  Sparkles,
  Lock,
  Globe,
  RefreshCw,
  Cpu,
  Fingerprint,
  FileCheck,
  Hash,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type EpistemicDomain =
  | "FINANCIAL_OPS"
  | "SECURITY_AUDIT"
  | "LEGAL_REGULATORY"
  | "DISTRIBUTED_SYSTEMS"
  | "AI_ALIGNMENT"
  | "MACRO_ECONOMICS";

export type AssertionStatus = "PENDING" | "ATTESTED" | "CONTESTED" | "REJECTED";

export interface ValidatorVote {
  validatorId: string;
  nodeRegion: string;
  vote: "APPROVE" | "REJECT" | "ABSTAIN";
  confidenceWeight: number;
  latencyMs: number;
  signature: string;
  reasoning: string;
  timestamp: string;
}

export interface MerkleProofStep {
  position: "left" | "right";
  hash: string;
}

export interface EpistemicAssertion {
  id: string;
  claim: string;
  domain: EpistemicDomain;
  sourceTwinId: string;
  authorAgent: string;
  confidenceScore: number;
  citations: string[];
  leafHash: string;
  status: AssertionStatus;
  quorumRatio: number;
  votes: ValidatorVote[];
  blockHeight: number;
  merkleRoot: string;
  proof: MerkleProofStep[];
  createdAt: string;
  verifiedAt?: string;
  challengeReason?: string;
}

export interface ValidatorNode {
  id: string;
  name: string;
  region: string;
  reputationScore: number;
  weight: number;
  active: boolean;
  specialties: EpistemicDomain[];
}

export interface EpistemicBlock {
  height: number;
  previousBlockHash: string;
  blockHash: string;
  merkleRoot: string;
  assertionCount: number;
  timestamp: string;
  validatorSignatures: string[];
}

interface EpistemicConsensusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EpistemicConsensusModal({ open, onOpenChange }: EpistemicConsensusModalProps) {
  const [activeTab, setActiveTab] = useState<"vault" | "merkle" | "consensus" | "ledger">("vault");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [assertions, setAssertions] = useState<EpistemicAssertion[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<EpistemicBlock[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Merkle tab state
  const [selectedAssertion, setSelectedAssertion] = useState<EpistemicAssertion | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Consensus proposal state
  const [claimText, setClaimText] = useState("");
  const [proposalDomain, setProposalDomain] = useState<EpistemicDomain>("DISTRIBUTED_SYSTEMS");
  const [confidenceInput, setConfidenceInput] = useState(0.95);
  const [citationsInput, setCitationsInput] = useState("mesh://telemetry/benchmark-2026, audit://peer-nodes/sg1");
  const [proposalResult, setProposalResult] = useState<EpistemicAssertion | null>(null);
  const [isProposing, setIsProposing] = useState(false);

  // Challenge state
  const [challengeAssertionId, setChallengeAssertionId] = useState<string | null>(null);
  const [challengeReason, setChallengeReason] = useState("");
  const [isChallenging, setIsChallenging] = useState(false);

  const fetchVaultData = async () => {
    try {
      setLoading(true);
      const [statusRes, assertionsRes, ledgerRes] = await Promise.all([
        fetch("/api/v1/epistemic/vault/status"),
        fetch("/api/v1/epistemic/vault/assertions"),
        fetch("/api/v1/epistemic/vault/ledger"),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.success) setStatus(sData);
      }
      if (assertionsRes.ok) {
        const aData = await assertionsRes.json();
        if (aData.success) {
          setAssertions(aData.assertions);
          if (aData.assertions.length > 0 && !selectedAssertion) {
            setSelectedAssertion(aData.assertions[0]);
          }
        }
      }
      if (ledgerRes.ok) {
        const lData = await ledgerRes.json();
        if (lData.success) setLedgerBlocks(lData.blocks);
      }
    } catch (e) {
      console.error("Failed to load epistemic vault data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVaultData();
    }
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleVerifyProof = async () => {
    if (!selectedAssertion) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/v1/epistemic/vault/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leafHash: selectedAssertion.leafHash,
          proof: selectedAssertion.proof,
          expectedRoot: selectedAssertion.merkleRoot,
        }),
      });
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      console.error("Verification failed:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleProposeAssertion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claimText.trim()) return;

    setIsProposing(true);
    try {
      const citations = citationsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/v1/epistemic/vault/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: claimText,
          domain: proposalDomain,
          sourceTwinId: "twin_cockpit_operator",
          authorAgent: "Epistemic Chamber Proposer",
          confidenceScore: confidenceInput,
          citations,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProposalResult(data.assertion);
        setSelectedAssertion(data.assertion);
        await fetchVaultData();
      }
    } catch (e) {
      console.error("Failed to propose claim:", e);
    } finally {
      setIsProposing(false);
    }
  };

  const handleChallenge = async (assertionId: string) => {
    if (!challengeReason.trim()) return;
    setIsChallenging(true);
    try {
      const res = await fetch("/api/v1/epistemic/vault/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assertionId,
          challengeReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChallengeAssertionId(null);
        setChallengeReason("");
        await fetchVaultData();
      }
    } catch (e) {
      console.error("Failed to challenge claim:", e);
    } finally {
      setIsChallenging(false);
    }
  };

  const filteredAssertions = assertions.filter((a) => {
    const matchesDomain = selectedDomain === "ALL" || a.domain === selectedDomain;
    const matchesStatus = selectedStatus === "ALL" || a.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      a.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authorAgent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.leafHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesStatus && matchesSearch;
  });

  const getDomainColor = (domain: EpistemicDomain) => {
    switch (domain) {
      case "DISTRIBUTED_SYSTEMS":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "FINANCIAL_OPS":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SECURITY_AUDIT":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "AI_ALIGNMENT":
        return "bg-violet-500/10 text-violet-400 border-violet-500/30";
      case "LEGAL_REGULATORY":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MACRO_ECONOMICS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusBadge = (s: AssertionStatus) => {
    switch (s) {
      case "ATTESTED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ATTESTED
          </Badge>
        );
      case "CONTESTED":
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> CONTESTED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> REJECTED
          </Badge>
        );
      default:
        return <Badge className="bg-slate-700 text-slate-300">PENDING</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0 bg-slate-950/95 border-slate-800 backdrop-blur-2xl text-slate-100 shadow-2xl overflow-hidden rounded-2xl">
        {/* Header with Glowing Branding & Quick Stats */}
        <DialogHeader className="px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                  Epistemic Consensus & Knowledge Vault
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-widest bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                    BFT Merkle v2.1
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Decentralized Byzantine fault-tolerant verification and Merkle inclusion proofs for cross-twin outputs.
                </DialogDescription>
              </div>
            </div>

            {/* Top Quick Status Bar */}
            {status && (
              <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Vault Height</span>
                  <span className="font-semibold text-indigo-300">Block #{status.vaultHeight}</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Truth Quotient</span>
                  <span className="font-semibold text-emerald-400">{status.epistemicTruthQuotient}% ETQ</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Attested / Total</span>
                  <span className="font-semibold text-slate-200">
                    {status.attestedCount} / {status.totalAssertions}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Active Peers</span>
                  <span className="font-semibold text-cyan-400">{status.activeValidatorsCount} Regional Nodes</span>
                </div>
              </div>
            )}
          </div>

          {/* Merkle Root Banner */}
          {status?.merkleRoot && (
            <div className="mt-3 flex items-center justify-between bg-slate-950/70 border border-indigo-900/40 px-3.5 py-1.5 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden">
                <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400 shrink-0">Current Merkle Root:</span>
                <span className="text-indigo-300 truncate">{status.merkleRoot}</span>
              </div>
              <button
                onClick={() => copyToClipboard(status.merkleRoot)}
                className="text-slate-400 hover:text-white shrink-0 ml-2 flex items-center gap-1 text-[11px] transition-colors"
              >
                {copiedText === status.merkleRoot ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
          )}
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-6">
          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "vault"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-4 h-4" />
            Knowledge Vault ({assertions.length})
          </button>
          <button
            onClick={() => setActiveTab("merkle")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "merkle"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitMerge className="w-4 h-4" />
            Merkle Proof Verifier
          </button>
          <button
            onClick={() => setActiveTab("consensus")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "consensus"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Consensus Chamber & Proposer
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === "ledger"
                ? "border-indigo-500 text-indigo-300 bg-indigo-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Cryptographic Block Ledger ({ledgerBlocks.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: KNOWLEDGE VAULT */}
          {activeTab === "vault" && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search claims, author agents, or hashes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Domain Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-slate-500 text-[11px] font-mono mr-1">Domain:</span>
                  {[
                    "ALL",
                    "DISTRIBUTED_SYSTEMS",
                    "FINANCIAL_OPS",
                    "SECURITY_AUDIT",
                    "AI_ALIGNMENT",
                    "LEGAL_REGULATORY",
                    "MACRO_ECONOMICS",
                  ].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDomain(d)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        selectedDomain === d
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d.replace("_", " ")}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 text-[11px] font-mono mr-1">Status:</span>
                  {["ALL", "ATTESTED", "CONTESTED", "REJECTED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        selectedStatus === st
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assertions List */}
              <div className="space-y-3">
                {filteredAssertions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No assertions match the selected filters.
                  </div>
                ) : (
                  filteredAssertions.map((a) => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedAssertion?.id === a.id
                          ? "bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-950/30"
                          : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-[300px]">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDomainColor(a.domain)}>
                              {a.domain.replace("_", " ")}
                            </Badge>
                            {getStatusBadge(a.status)}
                            <span className="text-[11px] text-slate-400 font-mono">
                              Height #{a.blockHeight}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              by {a.authorAgent} ({a.sourceTwinId})
                            </span>
                          </div>

                          <p className="text-sm text-slate-100 font-medium leading-relaxed">
                            {a.claim}
                          </p>

                          {/* Citations */}
                          {a.citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Citations:</span>
                              {a.citations.map((c, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {a.challengeReason && (
                            <div className="p-2 mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                              <span className="font-semibold">Contested Reason:</span> {a.challengeReason}
                            </div>
                          )}
                        </div>

                        {/* Right Stats & Actions */}
                        <div className="flex flex-col items-end gap-2.5">
                          <div className="text-right">
                            <div className="text-xs font-mono text-emerald-400 font-semibold">
                              {(a.confidenceScore * 100).toFixed(1)}% Confidence
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Quorum: {(a.quorumRatio * 100).toFixed(0)}% ({a.votes.filter((v) => v.vote === "APPROVE").length}/{a.votes.length} peers)
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAssertion(a);
                                setActiveTab("merkle");
                              }}
                              className="text-xs h-7 px-2.5 bg-slate-800/60 hover:bg-indigo-600 hover:text-white border-slate-700"
                            >
                              <GitMerge className="w-3.5 h-3.5 mr-1" />
                              Verify Proof
                            </Button>

                            {a.status === "ATTESTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setChallengeAssertionId(a.id)}
                                className="text-xs h-7 px-2.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                                Challenge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Leaf Hash display */}
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Fingerprint className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-500">Leaf SHA-256:</span>
                          <span className="text-slate-300 truncate">{a.leafHash}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(a.leafHash)}
                          className="hover:text-white flex items-center gap-1 shrink-0 ml-2"
                        >
                          {copiedText === a.leafHash ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Inline Challenge Modal / Drawer */}
                      {challengeAssertionId === a.id && (
                        <div className="mt-3 p-3 bg-slate-950 border border-amber-500/40 rounded-xl space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                            <span>Challenge Epistemic Claim #{a.id}</span>
                            <button
                              onClick={() => setChallengeAssertionId(null)}
                              className="text-slate-500 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter counter-evidence or audit citation to contest..."
                            value={challengeReason}
                            onChange={(e) => setChallengeReason(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={isChallenging || !challengeReason.trim()}
                              onClick={() => handleChallenge(a.id)}
                              className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white"
                            >
                              {isChallenging ? "Submitting Challenge..." : "Broadcast Challenge to Validators"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MERKLE PROOF VERIFIER */}
          {activeTab === "merkle" && (
            <div className="space-y-6">
              {selectedAssertion ? (
                <div className="space-y-6">
                  {/* Selected Assertion Card */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-400">Target Leaf Under Verification</span>
                      {getStatusBadge(selectedAssertion.status)}
                    </div>
                    <p className="text-sm font-medium text-slate-100">{selectedAssertion.claim}</p>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <span>Block Height: #{selectedAssertion.blockHeight}</span>
                      <span>Proof Audit Path Depth: {selectedAssertion.proof.length} Steps</span>
                    </div>
                  </div>

                  {/* Cryptographic Proof Steps Visualizer */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                        Binary Merkle Inclusion Audit Path
                      </h4>
                      <Button
                        size="sm"
                        disabled={isVerifying}
                        onClick={handleVerifyProof}
                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-mono flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        {isVerifying ? "Verifying Math..." : "Execute Cryptographic Verification"}
                      </Button>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                      {/* Leaf Node */}
                      <div className="flex items-center gap-3 p-2 rounded bg-indigo-950/40 border border-indigo-500/40">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                          LEAF
                        </span>
                        <span className="text-indigo-200 truncate">{selectedAssertion.leafHash}</span>
                      </div>

                      {/* Audit Steps */}
                      {selectedAssertion.proof.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 pl-6 relative">
                          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-slate-800" />
                          <span className="text-slate-500 text-[11px]">↳ Level {idx + 1} ({step.position})</span>
                          <div className="flex-1 p-2 rounded bg-slate-900 border border-slate-800 truncate text-slate-300">
                            {step.hash}
                          </div>
                        </div>
                      ))}

                      {/* Expected Root */}
                      <div className="flex items-center gap-3 p-2 mt-3 rounded bg-emerald-950/30 border border-emerald-500/40">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          ROOT
                        </span>
                        <span className="text-emerald-300 truncate">{selectedAssertion.merkleRoot}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Result Banner */}
                  {verificationResult && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        verificationResult.verified
                          ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                          : "bg-rose-950/30 border-rose-500/50 text-rose-200"
                      }`}
                    >
                      {verificationResult.verified ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">
                          {verificationResult.verified
                            ? "Merkle Proof Successfully Verified"
                            : "Merkle Proof Verification Failed"}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{verificationResult.explanation}</p>
                        <div className="text-[11px] font-mono text-slate-400 mt-2">
                          Audit Path Depth: {verificationResult.proofDepth} | Verified against Target Root
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Select an assertion from the Knowledge Vault to view and verify its Merkle proof.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONSENSUS CHAMBER & PROPOSER */}
          {activeTab === "consensus" && (
            <div className="space-y-6">
              {/* Propose New Assertion Form */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Propose New Epistemic Research Assertion
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-indigo-300 border-indigo-500/40">
                    BFT Quorum Required: 66.7%
                  </Badge>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">Test Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setClaimText("Dhaka BDIX Edge local replication achieves 6.4ms P95 read latency under peak concurrency.");
                        setProposalDomain("DISTRIBUTED_SYSTEMS");
                        setConfidenceInput(0.992);
                        setCitationsInput("bdix://telemetry/latency-mesh/2026-09, audit://sqlite-edge/dhk-01");
                      }}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                    >
                      Dhaka BDIX Edge Latency
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimText("Autonomous WebGPU local BGE-m3 embedding model yields 2.1ms semantic cosine retrieval.");
                        setProposalDomain("AI_ALIGNMENT");
                        setConfidenceInput(0.975);
                        setCitationsInput("webgpu://bge-m3/client-perf, audit://tensor-core/fp16");
                      }}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                    >
                      WebGPU Local Embedding
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimText("Dual-factor idempotency token validation guarantees zero duplicate bKash merchant payouts.");
                        setProposalDomain("FINANCIAL_OPS");
                        setConfidenceInput(0.995);
                        setCitationsInput("bkash://pgw/settlement-schedule-2026, audit://idempotency/lock-store");
                      }}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                    >
                      bKash Idempotent Settlement
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimText("Unverified third-party scraper claims 99.99% uptime with zero citation logs.");
                        setProposalDomain("SECURITY_AUDIT");
                        setConfidenceInput(0.55);
                        setCitationsInput("");
                      }}
                      className="text-[11px] px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded border border-rose-800/60 transition-colors"
                    >
                      Simulate Rejectable Claim (Low Confidence)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleProposeAssertion} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-mono">Claim Description:</label>
                    <textarea
                      rows={2}
                      value={claimText}
                      onChange={(e) => setClaimText(e.target.value)}
                      placeholder="Enter verified epistemic claim, research conclusion, or algorithmic invariant..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-mono">Domain:</label>
                      <select
                        value={proposalDomain}
                        onChange={(e) => setProposalDomain(e.target.value as EpistemicDomain)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="DISTRIBUTED_SYSTEMS">DISTRIBUTED_SYSTEMS</option>
                        <option value="FINANCIAL_OPS">FINANCIAL_OPS</option>
                        <option value="SECURITY_AUDIT">SECURITY_AUDIT</option>
                        <option value="AI_ALIGNMENT">AI_ALIGNMENT</option>
                        <option value="LEGAL_REGULATORY">LEGAL_REGULATORY</option>
                        <option value="MACRO_ECONOMICS">MACRO_ECONOMICS</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-mono">
                        Confidence Score: {(confidenceInput * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.01"
                        value={confidenceInput}
                        onChange={(e) => setConfidenceInput(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1 font-mono">Citations (comma-separated):</label>
                      <input
                        type="text"
                        value={citationsInput}
                        onChange={(e) => setCitationsInput(e.target.value)}
                        placeholder="e.g. audit://doc1, mesh://stat2"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isProposing || !claimText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isProposing ? "Executing BFT Quorum..." : "Submit to Validator Quorum & Mine Block"}
                    </Button>
                  </div>
                </form>

                {proposalResult && (
                  <div className="p-3 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300">Quorum Decision: {proposalResult.status}</span>
                      <span className="font-mono text-slate-400">
                        Quorum: {(proposalResult.quorumRatio * 100).toFixed(1)}% ({proposalResult.votes.filter(v => v.vote === 'APPROVE').length}/{proposalResult.votes.length} votes)
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 truncate">
                      Assigned Leaf Hash: {proposalResult.leafHash}
                    </div>
                  </div>
                )}
              </div>

              {/* Validator Peer Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  Global Twin Validator Peer Network
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {status?.validators?.map((val: ValidatorNode) => (
                    <div
                      key={val.id}
                      className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-semibold text-slate-200">{val.name}</span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Active
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        Region: {val.region}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/80">
                        <span className="text-slate-500">Reputation: {val.reputationScore}%</span>
                        <span className="text-indigo-400">Weight: {val.weight}x</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {val.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRYPTOGRAPHIC BLOCK LEDGER */}
          {activeTab === "ledger" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Historical Epistemic Blocks ({ledgerBlocks.length})
              </h4>
              <div className="space-y-2">
                {ledgerBlocks.map((b) => (
                  <div
                    key={b.height}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-slate-100">Block #{b.height}</span>
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-[10px]">
                          {b.assertionCount} Assertions
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(b.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span className="text-slate-500 truncate mr-2">Merkle Root:</span>
                      <span className="text-indigo-300 truncate">{b.merkleRoot}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="text-slate-500 truncate mr-2">Block Hash:</span>
                      <span className="text-slate-300 truncate">{b.blockHash}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Validator Signatures: {b.validatorSignatures?.length || 5} Peer Sign-offs</span>
                      <span className="text-emerald-400">Cryptographically Sealed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Integrity: SHA-256 Merkle proofs with BFT quorum attestation.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchVaultData}
              className="h-7 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Sync Ledger
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-7 text-xs border-slate-700 hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
