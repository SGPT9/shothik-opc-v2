

import BillingPage from "@/components/subscription/BillingPage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/providers/AuthProvider";

export const dynamic = "force-dynamic";

export default function BillingRoute() {
  const { push } = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      toast.info(t("billing.signInRequired"));
      push("/auth/login?message=Please%20sign%20in%20to%20view%20billing");
    }
  }, [authIsLoading, isAuthenticated, push, t]);

  useEffect(() => {
    document.title = `${t("billing.title")} | Shothik AI`;
  }, [t]);

  return (
    <div className="px-3 py-6 sm:px-4 pb-24 md:pb-6">
      <Breadcrumb className="mb-4 sm:mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/account/settings">{t("billing.breadcrumbAccount")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t("billing.breadcrumbBilling")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold mb-6">{t("billing.title")}</h1>
      <BillingPage />
    </div>
  );
}
