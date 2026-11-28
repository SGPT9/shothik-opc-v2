import { PackageNotFoundView } from "@/components/(pricing-page)/(checkout-page)/PackageNotFoundView";
import { PackageSummaryCard } from "@/components/(pricing-page)/(checkout-page)/PackageSummaryCard";
import { PaymentFailedView } from "@/components/(pricing-page)/(checkout-page)/PaymentFailedView";
import { PaymentMethodCard } from "@/components/(pricing-page)/(checkout-page)/PaymentMethodCard";
import { PaymentSuccessView } from "@/components/(pricing-page)/(checkout-page)/PaymentSuccessView";
import { useCheckoutData } from "@/components/(pricing-page)/(checkout-page)/hooks/useCheckoutData";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ENV } from "@/config/env";
import { OUTCOME_MICRO_PASSES } from "@/lib/subscription-tiers";
import { initiatePayment } from "@/services/pricing.service";
import type { ErrorResponse } from "@/types/response.type";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useSearchParams } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

type PaymentStatus = "idle" | "processing" | "success" | "failed" | "pending";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const authState = useSelector((state: RootState) => (state as any)?.auth);
  const activeUser = authState?.user;
  const accessToken = authState?.accessToken;
  const { t } = useTranslation();
  const passIdFromQuery = searchParams.get("pass") || searchParams.get("passId");
  const packageId =
    searchParams.get("package") ||
    searchParams.get("package_id") ||
    searchParams.get("packageId") ||
    "starter-pass";
  const planIdFromQuery =
    searchParams.get("plan") ||
    searchParams.get("plan_id") ||
    searchParams.get("planId") ||
    "monthly";

  const selectedOutcomePass = passIdFromQuery
    ? OUTCOME_MICRO_PASSES.find((p) => p.id === passIdFromQuery)
    : undefined;

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentResult, setPaymentResult] = useState<{
    redirectUrl?: string;
    paymentUrl?: string;
    transactionId?: string;
  } | null>(null);
  const [passTrxId, setPassTrxId] = useState<string>("");
  const [passUnlockedMsg, setPassUnlockedMsg] = useState<string | null>(null);

  // Use checkout data hook
  const {
    currentPackage,
    paymentMethods,
    availablePlans,
    selectedPlan,
    selectedPlanId,
    setSelectedPlanId,
    isBangladesh,
    locationLoading,
    packageLoading,
    methodsLoading,
  } = useCheckoutData(packageId, planIdFromQuery);

  // Auto-select payment method when location is determined
  useEffect(() => {
    if (
      !locationLoading &&
      isBangladesh !== null &&
      paymentMethods.length > 0 &&
      !selectedPaymentMethod
    ) {
      setSelectedPaymentMethod(paymentMethods[0]._id);
    }
  }, [locationLoading, isBangladesh, paymentMethods, selectedPaymentMethod]);

  // Payment initiation mutation
  const initiatePaymentMutation = useMutation({
    mutationFn: (payload: {
      package: string;
      plan: string;
      payment_method: string;
      return_url: string;
      cancel_url: string;
      customer_email?: string;
      customer_name?: string;
      customer_phone?: string;
    }) => initiatePayment(payload),
    onSuccess: (data) => {
      const response = data?.data;
      if (response) {
        const transaction = response.payment_transaction;
        const transactionId = transaction?._id;

        if (transactionId) {
          sessionStorage.setItem("pending_transaction_id", transactionId);
        }

        setPaymentResult({
          redirectUrl: response.redirect_url,
          paymentUrl: response.payment_url,
          transactionId: transactionId,
        });

        if (response.redirect_url) {
          globalThis.window.location.href = response.redirect_url;
          setPaymentStatus("processing");
        } else if (response.payment_url) {
          globalThis.window.location.href = response.payment_url;
          setPaymentStatus("processing");
        } else {
          setPaymentStatus("pending");
          toast.success(t("pricing.paymentInitiated"));
        }
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      setPaymentStatus("failed");
      toast.error(
        error.response?.data?.message ||
          t("pricing.failedToInitiate"),
      );
    },
  });

  const handleOutcomePassPurchase = async () => {
    if (!selectedOutcomePass) return;
    if (!passTrxId.trim()) {
      toast.error("Please enter your bKash or Nagad Transaction ID (TrxID).");
      return;
    }
    setPaymentStatus("processing");
    try {
      const activeUserId = activeUser?.id || (activeUser as any)?._id || "usr_default";
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "Idempotency-Key": `pass_${selectedOutcomePass.id}_${Date.now()}`,
      };
      if (accessToken) {
        requestHeaders["Authorization"] = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/v1/subscriptions/passes:purchase", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          userId: activeUserId,
          passId: selectedOutcomePass.id,
          trxId: passTrxId.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to activate Outcome Pass.");
      }
      setPassUnlockedMsg(
        `${data.name} unlocked! +${selectedOutcomePass.credits} credits added (New Balance: ${data.newCreditsBalance}).`
      );
      setPaymentStatus("idle");
      toast.success("Outcome Pass activated!");
    } catch (err: any) {
      setPaymentStatus("idle");
      toast.error(err.message || "Failed to verify Outcome Pass TrxID.");
    }
  };

  const handlePaymentInitiation = () => {
    if (!currentPackage || !selectedPaymentMethod || !selectedPlanId) {
      toast.error(t("pricing.selectMethodAndPlan"));
      return;
    }

    const selectedMethod = paymentMethods.find(
      (m) => m._id === selectedPaymentMethod,
    );

    if (!selectedMethod) {
      toast.error(t("pricing.invalidPaymentMethod"));
      return;
    }

    if (!selectedPlan) {
      toast.error(t("pricing.invalidPlan"));
      return;
    }

    setPaymentStatus("processing");

    let baseUrl = ENV?.app_url || globalThis.window.location.origin;

    if (!baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const returnUrl = `${cleanBaseUrl}/pricing/checkout/success?package_id=${currentPackage._id}&plan_id=${selectedPlanId}`;
    const cancelUrl = `${cleanBaseUrl}/pricing/checkout/cancel?package_id=${currentPackage._id}&plan_id=${selectedPlanId}`;

    initiatePaymentMutation.mutate({
      package: currentPackage._id,
      plan: selectedPlanId,
      payment_method: selectedPaymentMethod,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });
  };

  // Check URL params for payment status
  useEffect(() => {
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");

    if (status === "success" && transactionId) {
      setPaymentStatus("success");
      setPaymentResult({ transactionId });
    } else if (status === "cancel" || status === "failed") {
      setPaymentStatus("failed");
    }
  }, [searchParams]);

  // Loading state
  if (packageLoading && !currentPackage) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-6 lg:py-12">
        <Spinner className="text-primary h-8 w-8" />
      </div>
    );
  }

  // Package not found
  if (!currentPackage) {
    return <PackageNotFoundView />;
  }

  // Payment success
  if (paymentStatus === "success") {
    return (
      <PaymentSuccessView
        package={currentPackage}
        transactionId={paymentResult?.transactionId}
      />
    );
  }

  // Payment failed
  if (paymentStatus === "failed") {
    return (
      <PaymentFailedView
        package={currentPackage}
        onRetry={() => {
          setPaymentStatus("idle");
          setPaymentResult(null);
        }}
      />
    );
  }

  // Main checkout view
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col space-y-6 py-6 lg:py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">{t("pricing.checkout")}</h1>
        <p className="text-muted-foreground">{t("pricing.completePurchase")}</p>
      </div>

      {selectedOutcomePass && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  1-Tap Outcome Micro-Pass: {selectedOutcomePass.name}
                </h2>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                ৳{selectedOutcomePass.priceBdt} BDT (+{selectedOutcomePass.credits} Credits)
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedOutcomePass.outcome}
            </p>
            {passUnlockedMsg ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {passUnlockedMsg}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={passTrxId}
                  onChange={(e) => setPassTrxId(e.target.value)}
                  placeholder="Enter bKash / Nagad TrxID (e.g. 9K72AX48LP)"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={handleOutcomePassPurchase}
                  disabled={paymentStatus === "processing"}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {paymentStatus === "processing" ? "Activating..." : `Unlock for ৳${selectedOutcomePass.priceBdt}`}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <PackageSummaryCard
          package={currentPackage}
          availablePlans={availablePlans}
          selectedPlanId={selectedPlanId}
          selectedPlan={selectedPlan}
          onPlanSelect={setSelectedPlanId}
          isBangladesh={isBangladesh}
        />

        <PaymentMethodCard
          methods={paymentMethods}
          selectedMethodId={selectedPaymentMethod}
          selectedPlan={selectedPlan}
          isBangladesh={isBangladesh}
          onMethodSelect={setSelectedPaymentMethod}
          onPaymentInitiate={handlePaymentInitiation}
          isProcessing={
            paymentStatus === "processing" || initiatePaymentMutation.isPending
          }
          isDisabled={
            !selectedPaymentMethod ||
            !selectedPlan ||
            !selectedPlanId ||
            paymentStatus === "processing" ||
            initiatePaymentMutation.isPending
          }
        />
      </div>

      {paymentStatus === "pending" && paymentResult && (
        <Card className="bg-muted">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <p className="text-sm">
                {t("pricing.paymentProcessing")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CheckoutPage;
