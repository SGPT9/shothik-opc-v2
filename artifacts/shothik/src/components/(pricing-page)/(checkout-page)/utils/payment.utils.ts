/**
 * Utility functions for payment method filtering
 */

import type { TPaymentMethod } from "@/types/payment-method.type";

/**
 * Filter payment methods based on user location
 */
export const filterPaymentMethodsByLocation = (
  allMethods: TPaymentMethod[],
  isBangladesh: boolean | null,
  locationLoading: boolean,
): TPaymentMethod[] => {
  if (!allMethods || allMethods.length === 0) return [];

  if (locationLoading || isBangladesh === null) {
    return allMethods;
  }

  if (isBangladesh) {
    // Bangladesh: Show bKash, Nagad, SSLCommerz, and BDT methods
    const bdMethods = allMethods.filter((method: any) => {
      const name = (method.name || "").toLowerCase();
      const code = (method.code || method.value || "").toLowerCase();
      const currency = method.currency;
      return (
        method.is_bangladesh ||
        currency === "BDT" ||
        code.includes("bkash") ||
        code.includes("nagad") ||
        code.includes("ssl") ||
        name.includes("bkash") ||
        name.includes("nagad") ||
        name.includes("ssl")
      );
    });
    return bdMethods.length > 0 ? bdMethods : allMethods;
  } else {
    // Other countries: Show Stripe and USD methods
    const intlMethods = allMethods.filter((method: any) => {
      const name = (method.name || "").toLowerCase();
      const code = (method.code || method.value || "").toLowerCase();
      const currency = method.currency;
      return (
        currency === "USD" ||
        code.includes("stripe") ||
        name.includes("stripe") ||
        name.includes("card")
      );
    });
    return intlMethods.length > 0 ? intlMethods : allMethods;
  }
};
