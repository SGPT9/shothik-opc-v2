

import type { TPaymentMethod } from "@/types/payment-method.type";

type PaymentTotalProps = {
  selectedMethod: TPaymentMethod | undefined;
  selectedPlan: any;
};

export const PaymentTotal: React.FC<PaymentTotalProps> = ({
  selectedMethod,
  selectedPlan,
}) => {
  if (!selectedMethod || !selectedPlan || !selectedPlan.price) return null;

  const currencyCode = (selectedMethod.currency || (selectedMethod.code === "stripe" ? "USD" : "BDT")).toUpperCase();
  const amount =
    currencyCode === "USD"
      ? selectedPlan.price.USD ?? 0.85
      : selectedPlan.price.BDT ?? 100;

  return (
    <div className="border-t pt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: currencyCode === "USD" ? "USD" : "BDT",
            }).format(amount)}
          </span>
        </div>
      </div>
    </div>
  );
};

