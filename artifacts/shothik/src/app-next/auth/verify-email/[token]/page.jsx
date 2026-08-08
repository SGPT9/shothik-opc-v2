

import { useVerifyEmailMutation } from "@/redux/api/auth/authApi";
import { useParams, useRouter } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [verifyEmail, { isLoading, isSuccess, isError, error }] =
    useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail({ key: token });
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    if (isSuccess) {
      // 
      toast.success(t("auth.messages.emailVerificationSuccess"));
      setTimeout(() => {
        router.push("/");
      }, 0);
    }

    if (isError) {
      // console.error("Email verification failed:", error);
      if (error?.data?.message === "Invalid or expired token") {
        toast.error(t("auth.messages.tokenExpired"));
      } else {
        toast.error(t("auth.messages.emailVerificationFailed"));
      }
      setTimeout(() => {
        router.push("/");
      }, 2500);
    }
  }, [isSuccess, isError, error, router, t]);

  return null;
}
