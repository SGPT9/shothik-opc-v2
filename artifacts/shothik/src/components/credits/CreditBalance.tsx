import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditBalanceProps {
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export default function CreditBalance({ onClick, className, size = "md" }: CreditBalanceProps) {
  const user = useSelector((state: any) => state.auth?.user);
  const [balance, setBalance] = useState<number>(550);

  useEffect(() => {
    let mounted = true;
    const userId = user?.id || user?._id || "guest";

    fetch("/api/v1/subscriptions/me", {
      headers: { "x-user-id": userId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.success && data.data?.subscription) {
          const tier = data.data.subscription.tier;
          const tierCredits = tier === "team" ? 50000 : tier === "pro" ? 15000 : 500;
          setBalance(tierCredits);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-amber-950/30 px-3 py-1.5 font-semibold text-amber-400 transition-colors hover:bg-amber-950/50",
        size === "sm" && "gap-1 px-2 py-1 text-xs",
        size === "md" && "text-sm",
        className
      )}
      aria-label={`Credit balance: ${balance} credits. Click to purchase more.`}
    >
      <Coins className={cn("fill-amber-400", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      <span className="tabular-nums">{balance.toLocaleString()}</span>
    </button>
  );
}
