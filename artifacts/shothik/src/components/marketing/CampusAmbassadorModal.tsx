import React, { useState } from "react";
import {
  GraduationCap,
  Trophy,
  Share2,
  Copy,
  DollarSign,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { campusAmbassadorService } from "@/lib/marketing/campus-ambassador-service";

export interface CampusAmbassadorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampusAmbassadorModal({ isOpen, onClose }: CampusAmbassadorModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const myReferralCode = "SHOTHIK_DU_ARIF";
  const leaderboard = campusAmbassadorService.getLeaderboard();

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://shothik.ai/ref/${myReferralCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-zinc-950/95 border-zinc-800 text-white shadow-2xl p-0 overflow-hidden rounded-2xl backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                Campus Ambassador & Student Pack Referral Engine
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  15% bKash Payout
                </Badge>
              </DialogTitle>
              <p className="text-xs text-zinc-400">
                Share ShothikGPT student packs across DU, BUET, NSU, BRAC & SUST to earn instant bKash commissions
              </p>
            </div>
          </div>
        </div>

        {/* My Referral Link Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-950/30 via-zinc-900/60 to-zinc-950 border-b border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Your Personal Student Referral Link
            </span>
            <span className="text-xs text-zinc-400 font-mono">15% bKash Commission per Referral</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`https://shothik.ai/ref/${myReferralCode}`}
              className="flex-1 px-3 py-2 text-xs bg-zinc-900 rounded-xl border border-zinc-800 text-emerald-300 font-mono focus:outline-none"
            />
            <Button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
              {copiedCode ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Inter-Campus Leaderboard */}
        <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Bangladesh Inter-Campus Leaderboard
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Updated Real-Time</span>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((amb, idx) => (
              <div
                key={amb.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold font-mono text-amber-400 border border-zinc-700">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {amb.studentName}
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px]">
                        {amb.universityName}
                      </Badge>
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono">Code: {amb.referralCode}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    ৳{amb.totalEarnedCommissionBdt.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">{amb.totalReferralsCount} Referrals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 text-xs">
          <span className="text-zinc-500 font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Automatic Bi-Monthly bKash Disbursements Active
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
            Close Program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
