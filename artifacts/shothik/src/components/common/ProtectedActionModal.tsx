import React, { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ProtectedActionModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  actionId: string;
  actorPhone: string;
  simulatedOtp?: string;
  onSuccess: (sealHash: string) => void;
  onClose: () => void;
}

export const ProtectedActionModal: React.FC<ProtectedActionModalProps> = ({
  isOpen,
  actionTitle,
  actionDescription,
  actionId,
  actorPhone,
  simulatedOtp,
  onSuccess,
  onClose,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/protected-actions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, otpCode: otp }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.auditSealSha256);
        onClose();
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{actionTitle}</h3>
              <p className="text-xs text-slate-400">Human Approval & 2FA Gate</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          {actionDescription}
        </p>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block">
            Enter 6-Digit Verification Code sent to <span className="text-slate-200 font-mono">{actorPhone}</span>
          </label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="• • • • • •"
            className="w-full text-center tracking-[0.5em] text-lg font-mono bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-amber-400 focus:outline-none focus:border-amber-500"
          />
          {simulatedOtp && (
            <p className="text-[11px] text-slate-500 text-center">
              Dev Demo Code: <span className="font-mono text-amber-400 font-bold">{simulatedOtp}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || loading}
            className="flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? "Verifying..." : "Confirm & Execute"}
          </button>
        </div>
      </div>
    </div>
  );
};
