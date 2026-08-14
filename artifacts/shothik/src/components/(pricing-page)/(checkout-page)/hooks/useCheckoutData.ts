/**
 * Custom hook for checkout data management
 */

import { useUserLocation } from "@/hooks/utils/useUserLocation";
import {
  fetchPublicPackages,
  fetchPublicPaymentMethods,
} from "@/services/pricing.service";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { filterPaymentMethodsByLocation } from "../utils/payment.utils";
import { getPlanId } from "../utils/plan.utils";

const FALLBACK_PACKAGES: Record<string, any> = {
  "starter-pass": {
    _id: "starter-pass",
    name: "Starter Student Micro-Pass",
    description: "Ideal for university assignments, thesis Turnitin checks, and single slide deck creation.",
    package_for: "User",
    price: { USD: 0.85, BDT: 100 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 0.85, BDT: 100 },
        token: 50,
        is_initial: true,
      },
    ],
  },
  "pro-operator": {
    _id: "pro-operator",
    name: "Pro Operator Pack",
    description: "Most popular for solo entrepreneurs, developers, and agency copywriters.",
    package_for: "User",
    price: { USD: 8.50, BDT: 990 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 8.50, BDT: 990 },
        token: 550,
        is_initial: true,
      },
    ],
  },
  "venture-twin": {
    _id: "venture-twin",
    name: "Venture Twin & OPC",
    description: "For active startups and digital businesses automating sales, marketing, and logistics.",
    package_for: "User",
    price: { USD: 19.99, BDT: 2400 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 19.99, BDT: 2400 },
        token: 1500,
        is_initial: true,
      },
    ],
  },
  "agency-scale": {
    _id: "agency-scale",
    name: "Agency & Enterprise",
    description: "High-throughput AI infrastructure, unlimited team members, and priority DeepSeek R1 nodes.",
    package_for: "User",
    price: { USD: 49.99, BDT: 6000 },
    plans: [
      {
        plan: { _id: "monthly", name: "Monthly", duration: 30 },
        price: { USD: 49.99, BDT: 6000 },
        token: 5000,
        is_initial: true,
      },
    ],
  },
};

const FALLBACK_PAYMENT_METHODS = [
  { _id: "bkash", name: "bKash (Personal/Merchant)", code: "bkash", currency: "BDT", is_active: true, is_bangladesh: true },
  { _id: "nagad", name: "Nagad Instant Checkout", code: "nagad", currency: "BDT", is_active: true, is_bangladesh: true },
  { _id: "stripe", name: "Credit / Debit Card (Stripe)", code: "stripe", currency: "USD", is_active: true, is_bangladesh: false },
];

export const useCheckoutData = (
  packageId: string | null,
  planIdFromQuery: string | null,
) => {
  const { isBangladesh, loading: locationLoading } = useUserLocation();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Fetch package
  const { data: packageResponse, isLoading: packageLoading } = useQuery({
    queryKey: ["public-package", packageId],
    queryFn: () => {
      if (!packageId) throw new Error("Package ID is required");
      return fetchPublicPackages({ _id: packageId, is_active: true });
    },
    enabled: !!packageId,
  });

  // Fetch payment methods
  const { data: paymentMethodsResponse, isLoading: methodsLoading } = useQuery({
    queryKey: ["public-payment-methods"],
    queryFn: () =>
      fetchPublicPaymentMethods({ is_active: true, sort: "sequence" }),
  });

  const currentPackage = packageResponse?.data?.[0] || (packageId ? FALLBACK_PACKAGES[packageId] || FALLBACK_PACKAGES["starter-pass"] : FALLBACK_PACKAGES["starter-pass"]);
  const allPaymentMethods = (paymentMethodsResponse?.data && paymentMethodsResponse.data.length > 0) ? paymentMethodsResponse.data : FALLBACK_PAYMENT_METHODS;

  // Filter payment methods based on location
  const paymentMethods = useMemo(
    () =>
      filterPaymentMethodsByLocation(
        allPaymentMethods,
        isBangladesh,
        locationLoading,
      ),
    [allPaymentMethods, isBangladesh, locationLoading],
  );

  // Determine initial plan - filter only active plans
  const allPlans = currentPackage?.plans || [];
  const availablePlans = allPlans.filter((pp: any) => pp.is_active !== false);
  const initialPlan =
    availablePlans.find((pp: any) => pp.is_initial) || availablePlans[0];

  // Set selected plan on mount
  useEffect(() => {
    if (planIdFromQuery) {
      setSelectedPlanId(planIdFromQuery);
    } else if (initialPlan) {
      const planId = getPlanId(initialPlan.plan);
      if (planId) {
        setSelectedPlanId(planId);
      }
    }
  }, [planIdFromQuery, initialPlan]);

  // Get selected plan details
  const selectedPlan = useMemo(() => {
    return (
      availablePlans.find((pp: any) => {
        const planId = getPlanId(pp.plan);
        return planId === selectedPlanId;
      }) || initialPlan
    );
  }, [availablePlans, selectedPlanId, initialPlan]);

  return {
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
  };
};
