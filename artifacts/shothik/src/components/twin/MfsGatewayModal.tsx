"use client";

import { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Key,
  Smartphone,
  Check,
  AlertCircle,
  RefreshCcw,
  ArrowRight,
  TrendingUp,
  Building2,
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
import { Switch } from "@/components/ui/switch";
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface MfsGatewayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

export function MfsGatewayModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: MfsGatewayModalProps) {
  const [isSandbox, setIsSandbox] = useState(true);
  const [provider, setProvider] = useState<"bkash" | "nagad">("bkash");

  // Credentials
  const [appKey, setAppKey] = useState("bkash_test_key_884920491");
  const [appSecret, setAppSecret] = useState("••••••••••••••••••••••••");
  const [merchantNumber, setMerchantNumber] = useState("01711002233");
  const [webhookUrl, setWebhookUrl] = useState(
    `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.shothikgpt.com/api/webhooks/mfs`
  );

  // Simulator State
  const [activeTab, setActiveTab] = useState<"credentials" | "simulator">("credentials");
  const [simStep, setSimStep] = useState<"phone" | "otp" | "pin" | "success">("phone");
  const [simPhone, setSimPhone] = useState("01812345678");
  const [simAmount, setSimAmount] = useState(1250);
  const [simOtp, setSimOtp] = useState("123456");
  const [simPin, setSimPin] = useState("12345");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCredentials = () => {
    setSavedSuccess(true);
    saveOfflineTask({
      id: "bkash-gw-config",
      title: `Verify live bKash & Nagad MFS merchant webhooks for ${companyName}`,
      category: "DevOps",
      status: "completed",
      cost: "1 Credit",
      updatedAt: Date.now(),
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsProcessing(false);
    if (simStep === "phone") setSimStep("otp");
    else if (simStep === "otp") setSimStep("pin");
    else if (simStep === "pin") {
      setSimStep("success");
      saveOfflineTask({
        id: `sim-order-${Date.now()}`,
        title: `Processed ৳${simAmount.toLocaleString()} via bKash Checkout Simulator`,
        category: "Strategy",
        status: "completed",
        cost: "0 Credits",
        updatedAt: Date.now(),
      });
    }
  };

  const handleResetSimulator = () => {
    setSimStep("phone");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>bKash & Nagad MFS Payment Gateway</span>
                <Badge variant="outline" className="border-pink-500/40 text-pink-400 font-mono text-[10px]">
                  1.85% Fee Math Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Configure merchant credentials, webhook signature keys, and test live 1-Tap checkout.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-800 p-0.5 bg-slate-950">
            <button
              type="button"
              onClick={() => setActiveTab("credentials")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "credentials" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Credentials & Webhooks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "simulator" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Checkout Simulator
            </button>
          </div>
        </div>

        {/* Tab 1: Credentials & Webhooks */}
        {activeTab === "credentials" && (
          <div className="p-6 space-y-5">
            {/* Sandbox Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Sandbox Test Mode
                </span>
                <p className="text-[11px] text-slate-400">
                  Simulate bKash and Nagad payment flows without charging real customer mobile wallets.
                </p>
              </div>
              <Switch
                checked={isSandbox}
                onCheckedChange={setIsSandbox}
                aria-label="Toggle Sandbox Mode"
              />
            </div>

            {/* Provider Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Primary Payment Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProvider("bkash")}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    provider === "bkash"
                      ? "border-pink-500/80 bg-pink-500/10 text-pink-300"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">bKash Merchant Direct (PGW)</span>
                    <span className="text-[10px] font-mono opacity-80">1.85% Transaction Fee</span>
                  </div>
                  {provider === "bkash" && <CheckCircle2 className="h-4 w-4 text-pink-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setProvider("nagad")}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    provider === "nagad"
                      ? "border-orange-500/80 bg-orange-500/10 text-orange-300"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">Nagad E-Commerce API</span>
                    <span className="text-[10px] font-mono opacity-80">1.50% Transaction Fee</span>
                  </div>
                  {provider === "nagad" && <CheckCircle2 className="h-4 w-4 text-orange-400" />}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">
                  Merchant App Key
                </label>
                <input
                  type="text"
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">
                  Merchant App Secret
                </label>
                <input
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">
                  Merchant Wallet MSISDN
                </label>
                <input
                  type="text"
                  value={merchantNumber}
                  onChange={(e) => setMerchantNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase mb-1">
                  Automated Webhook Ingress URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-400 focus-visible:outline-none"
                />
              </div>
            </div>

            {/* Signature Security Badge */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 font-mono">
                <span className="font-bold">x-signature-sha256 Webhook Verification Enabled</span>
                <p className="text-[11px] text-emerald-300/80 font-sans">
                  Incoming bKash IPNs are automatically cryptographically validated against your public key before crediting orders.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <Button
                onClick={handleSaveCredentials}
                className="rounded-xl px-5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs gap-1.5"
                data-testid="button-save-mfs-credentials"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" /> Credentials Saved & Verified!
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Save Gateway Credentials
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Checkout Simulator */}
        {activeTab === "simulator" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target Amount:</span>
                <span className="text-emerald-400 font-bold">৳{simAmount.toLocaleString()} BDT</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Estimated bKash Fee:</span>
                <span className="text-rose-400 font-bold">-৳{(simAmount * 0.0185).toFixed(2)} BDT</span>
              </div>
            </div>

            {/* Simulated bKash PGW Modal Frame */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl border-2 border-pink-500/50 bg-[#e2136e] p-5 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <span className="font-extrabold text-sm tracking-wider">bKash Payment</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">SANDBOX</span>
                </div>

                <div className="bg-white rounded-xl p-4 text-slate-900 space-y-3 shadow-inner">
                  {simStep === "phone" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Your bKash Account Number
                        </label>
                        <input
                          type="text"
                          value={simPhone}
                          onChange={(e) => setSimPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        By clicking Confirm, you agree to the terms and conditions.
                      </p>
                    </div>
                  )}

                  {simStep === "otp" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Verification Code (OTP) sent to {simPhone}
                        </label>
                        <input
                          type="text"
                          value={simOtp}
                          onChange={(e) => setSimOtp(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-mono font-bold text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 text-center font-mono">
                        Resend code in 45s
                      </p>
                    </div>
                  )}

                  {simStep === "pin" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Enter bKash 5-Digit PIN
                        </label>
                        <input
                          type="password"
                          value={simPin}
                          onChange={(e) => setSimPin(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 p-2 text-sm font-mono font-bold text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <p className="text-[10px] text-rose-500 font-semibold text-center">
                        Never share your PIN with anyone.
                      </p>
                    </div>
                  )}

                  {simStep === "success" && (
                    <div className="text-center py-4 space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">Payment Successful!</h4>
                      <p className="text-xs text-slate-600 font-mono">
                        TrxID: TRX_BKASH_{Math.random().toString(36).substring(2, 9).toUpperCase()}
                      </p>
                    </div>
                  )}

                  {simStep !== "success" ? (
                    <Button
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      className="w-full bg-[#e2136e] hover:bg-[#c2105e] text-white font-bold text-xs h-9 shadow-md"
                      data-testid="button-confirm-simulator"
                    >
                      {isProcessing ? "Verifying..." : simStep === "phone" ? "Next: Send OTP" : simStep === "otp" ? "Next: Enter PIN" : "Confirm Payment"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResetSimulator}
                      variant="outline"
                      className="w-full text-xs font-semibold"
                    >
                      <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Test Another Checkout
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
