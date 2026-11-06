import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Crown,
  Check,
  X,
  Sparkles,
  BookOpen,
  Zap,
  GraduationCap,
} from "lucide-react";
import { Link } from "wouter";

const STARTER_PASS_FEATURES = [
  { text: "1,200 Universal Shothik Credits", included: true },
  { text: "50,000 Words/day Paraphrase & Bypass", included: true },
  { text: "Full 45 InkOS Writing Studio Engines", included: true },
  { text: "Export to DOCX / EPUB / 6x9 PDF", included: true },
  { text: "5-Day Sprint Validity", included: true },
  { text: "Monthly Auto-Refill (8,000 Credits)", included: false },
];

const PRO_FEATURES = [
  { text: "8,000 Universal Shothik Credits / mo", included: true },
  { text: "Unlimited Words & Paraphrase", included: true },
  { text: "All 45 InkOS Studio & Audio Engines", included: true },
  { text: "AI Detection & Turnitin-Grade Scans", included: true },
  { text: "Export to DOCX / HTML / 6x9 Print PDF", included: true },
  { text: "Priority Support & Boi Mela Preflight", included: true },
];

export function WritingStudioUpgradeModal({ open, onClose, limitType = "ai_actions" }) {
  const limitMessages = {
    ai_actions: "You've used all your free AI actions for today",
    citations: "You've reached your daily citation lookup limit",
    export: "DOCX and HTML export requires an upgrade",
    ai_scan: "AI detection scans require an upgrade",
    plagiarism: "Plagiarism checking requires an upgrade",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Shothik Pro Operator
          </DialogTitle>
          <DialogDescription>
            {limitMessages[limitType] || "Unlock the full power of InkOS Writing Studio & Outcome Passes"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4 border-muted">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Starter Pass (5-Day Sprint)</h3>
              <Badge variant="secondary">Micro-Pass</Badge>
            </div>
            <p className="text-2xl font-bold mb-4">
              ৳100<span className="text-sm font-normal text-muted-foreground"> / $0.85</span>
            </p>
            <ul className="space-y-2">
              {STARTER_PASS_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={!feature.included ? "text-muted-foreground" : ""}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <Link href="/checkout?package=starter-pass&plan=one_time">
              <Button variant="outline" className="w-full" size="sm">
                Get 5-Day Starter Pass (৳100)
              </Button>
            </Link>
          </Card>

          <Card className="p-4 border-primary ring-2 ring-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Pro Operator
              </h3>
              <Badge className="bg-gradient-to-r from-primary to-purple-500">Recommended</Badge>
            </div>
            <p className="text-2xl font-bold mb-4">
              ৳990<span className="text-sm font-normal text-muted-foreground">/mo</span>
              <span className="text-xs text-muted-foreground ml-2">or $8.50/mo</span>
            </p>
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature.text}
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <Link href="/pricing">
              <Button className="w-full" size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Now (bKash / Nagad / Card)
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Includes 8,000 universal Shothik credits & all 45 InkOS Studio engines.
            </p>
          </Card>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mt-2">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">0 Credits for Writing & Story Bible (#10)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Credits only burn when you trigger heavy AI co-authoring, 24kHz Bangla voice casting, or 6x9 print preflight.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UsageLimitBanner({ used, limit, type = "AI actions" }) {
  const remaining = Math.max(0, limit - used);
  
  if (remaining > 1) return null;
  
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
      remaining === 0 ? "bg-red-500/10 text-red-600" : "bg-yellow-500/10 text-yellow-600"
    }`}>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        <span>
          {remaining === 0 
            ? `Daily ${type} limit reached` 
            : `${remaining} ${type} remaining today`}
        </span>
      </div>
      <Link href="/pricing">
        <Button size="sm" variant="ghost" className="h-7 text-xs">
          Upgrade
        </Button>
      </Link>
    </div>
  );
}

export const USAGE_LIMITS = {
  free: {
    ai_actions: 3,
    citations: 5,
    ai_scans: 0,
    export_formats: ["txt"],
  },
  pro: {
    ai_actions: Infinity,
    citations: Infinity,
    ai_scans: Infinity,
    export_formats: ["txt", "html", "docx"],
  },
};
