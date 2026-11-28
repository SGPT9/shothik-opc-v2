

import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useTranslation } from "@/i18n";
import { ArrowRight, MailCheck } from "lucide-react";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";

export default function VerifyEmailCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = useMemo(
    () => `/auth/login?email=${encodeURIComponent(email.trim())}`,
    [email],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(normalizedEmail)) {
      setError(t("auth.messages.verifyEmailMismatch"));
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(t("auth.messages.verifyEmailOtp"));
      return;
    }

    setIsSubmitting(true);

    try {
      const insforge = getInsforgeBrowserClient();
      if (!insforge) {
        throw new Error(t("auth.messages.unableToVerify"));
      }

      const { error: verifyError } = typeof (insforge.auth as any).verifyOtp === "function"
        ? await (insforge.auth as any).verifyOtp({
            email: normalizedEmail,
            token: normalizedOtp,
            type: "email",
          })
        : await (insforge.auth as any).verifyEmail({
            email: normalizedEmail,
            otp: normalizedOtp,
          });

      if (verifyError) {
        throw new Error(verifyError.message || t("auth.messages.unableToVerify"));
      }

      setSuccess(t("auth.messages.emailVerifiedRedirect"));
      window.setTimeout(() => {
        router.replace(`/auth/login?email=${encodeURIComponent(normalizedEmail)}&verified=1`);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.messages.unableToVerify"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
          <MailCheck className="h-3.5 w-3.5 text-brand" />
          {t("auth.emailVerification")}
        </div>

        <h1 className="mt-6 text-3xl font-bold text-foreground">{t("auth.enterVerificationCodeTitle")}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {t("auth.verifyEmailDescription")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              autoComplete="email"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-foreground">
              {t("auth.verificationCode")}
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="123456"
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? t("auth.verifying") : t("auth.verifyEmail")}
            {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {success ? (
          <p role="status" className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
            {success}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <Link href={loginHref} className="text-primary hover:underline">
            {t("auth.backToSignIn")}
          </Link>
          <Link href="/auth/register" className="text-muted-foreground hover:text-foreground">
            {t("auth.createAnotherAccount")}
          </Link>
        </div>
      </div>
    </div>
  );
}
