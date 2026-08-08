

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/i18n";
import { Link } from "wouter";
import AuthWithSocial from "@/components/auth/AuthWithSocial";
import LogtoSignInButton from "@/components/auth/LogtoSignInButton";
import { ArrowRight, BookOpen, FilePenLine, FlaskConical, Layers3, Sparkles } from "lucide-react";
import {
  getLoginFlowVariant,
  normalizeAuthIntent,
  saveAuthFlowState,
  type AuthIntent,
} from "@/lib/auth-flow";
import { trackLoginIntentCaptured } from "@/lib/posthog";

const INTENT_CONFIG: Record<
  AuthIntent,
  {
    labelKey: string;
    titleKey: string;
    descriptionKey: string;
    href: string;
    icon: React.ElementType;
  }
> = {
  continue: {
    labelKey: "auth.intent.continueLabel",
    titleKey: "auth.intent.continueTitle",
    descriptionKey: "auth.intent.continueDescription",
    href: "/writing-studio?projects=1",
    icon: Layers3,
  },
  writing_studio: {
    labelKey: "auth.intent.writingStudioLabel",
    titleKey: "auth.intent.writingStudioTitle",
    descriptionKey: "auth.intent.writingStudioDescription",
    href: "/writing-studio",
    icon: Sparkles,
  },
  research: {
    labelKey: "auth.intent.researchLabel",
    titleKey: "auth.intent.researchTitle",
    descriptionKey: "auth.intent.researchDescription",
    href: "/writing-studio?intent=research",
    icon: FlaskConical,
  },
  assignment: {
    labelKey: "auth.intent.assignmentLabel",
    titleKey: "auth.intent.assignmentTitle",
    descriptionKey: "auth.intent.assignmentDescription",
    href: "/writing-studio?intent=assignment",
    icon: FilePenLine,
  },
  twin: {
    labelKey: "auth.intent.twinLabel",
    titleKey: "auth.intent.twinTitle",
    descriptionKey: "auth.intent.twinDescription",
    href: "/twin",
    icon: BookOpen,
  },
};

const LoginPage = () => {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(() =>
        searchParams.get("error") === "oauth"
            ? t("auth.messages.oauthFailed")
            : "",
    );
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [success, setSuccess] = useState(() =>
        searchParams.get("verified") === "1" ? t("auth.messages.emailVerified") : "",
    );
    const [googleLoading, setGoogleLoading] = useState(false);

    const loginVariant = useMemo(() => getLoginFlowVariant(), []);
    const initialIntent = normalizeAuthIntent(searchParams.get("intent"));
    const redirectTo = searchParams.get("redirect");
    const [intent, setIntent] = useState<AuthIntent>(initialIntent);

    const validateEmail = (email: string) => {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const nextFieldErrors: { email?: string; password?: string } = {};
        if (!validateEmail(email)) {
            nextFieldErrors.email = t("auth.messages.invalidEmail");
        }

        if (!validatePassword(password)) {
            nextFieldErrors.password = t("auth.messages.passwordTooShort");
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            setError(t("auth.messages.fixHighlighted"));
            return;
        }

        setIsLoading(true);

        try {
            saveAuthFlowState({
                intent,
                redirectTo,
                source: "login",
                variant: loginVariant,
            });
            trackLoginIntentCaptured(intent, loginVariant, "password");
            await login(email, password);
            setIsLoading(false);
            setSuccess(t("auth.messages.loginPreparingWorkspace"));
            router.replace("/auth/post-login");
        } catch (err) {
            setError(err instanceof Error ? err.message : t("auth.messages.loginFailed"));
            setIsLoading(false);
        }
    };

    const selectedIntentConfig = INTENT_CONFIG[intent];
    const SelectedIntentIcon = selectedIntentConfig.icon;
    const needsEmailVerification = error.toLowerCase().includes("verification");
    const verificationHref = `/auth/verify-email?email=${encodeURIComponent(email.trim())}`;

    const handleSocialSuccess = () => {
        saveAuthFlowState({
            intent,
            redirectTo,
            source: "login",
            variant: loginVariant,
        });
        trackLoginIntentCaptured(intent, loginVariant, "google");
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="flex flex-col justify-between border-b border-border px-6 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-brand" />
                            {t("auth.workspaceBadge")}
                        </div>
                        <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                            {t("auth.loginHeadline")}
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                            {t("auth.loginSubheadline")}
                        </p>
                    </div>

                    <div className="mt-10 rounded-3xl border border-border bg-card/80 p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10">
                                <SelectedIntentIcon className="h-5 w-5 text-brand" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {t("auth.selectedFirstStep")}
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-foreground">{t(selectedIntentConfig.titleKey)}</h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {t(selectedIntentConfig.descriptionKey)}
                                </p>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {t("auth.recommendedDestination")}{" "}
                                    <span className="font-medium text-foreground">{selectedIntentConfig.href}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {(Object.entries(INTENT_CONFIG) as [AuthIntent, (typeof INTENT_CONFIG)[AuthIntent]][]).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setIntent(key)}
                                    aria-pressed={intent === key}
                                    className={`rounded-2xl border p-4 text-left transition-all ${
                                        intent === key
                                            ? "border-brand/50 bg-brand/10 shadow-sm"
                                            : "border-border bg-card/60 hover:border-border/80 hover:bg-card"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background">
                                            <Icon className={`h-4.5 w-4.5 ${intent === key ? "text-brand" : "text-muted-foreground"}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{t(config.labelKey)}</p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(config.descriptionKey)}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 rounded-3xl border border-border bg-card/50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t("auth.loginFlowVariant")}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {loginVariant === "contextual"
                                ? t("auth.loginVariantContextual")
                                : t("auth.loginVariantStreamlined")}
                        </p>
                    </div>
                </section>

                <section className="flex items-center justify-center px-6 py-10 lg:px-12 lg:py-12">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm"
                        data-login-variant={loginVariant}
                    >
                        <div className="mb-8">
                            <p className="text-sm font-medium text-brand">{t("auth.welcomeBack")}</p>
                            <h2 className="mt-2 text-3xl font-bold text-foreground">{t("auth.signInToContinue")}</h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {t("auth.signInDescription")}
                            </p>
                        </div>

                        {/* Google sign-in — shown first so it's the primary path */}
                        <AuthWithSocial
                            loading={googleLoading}
                            setLoading={setGoogleLoading}
                            title="in"
                            onAuthSuccess={handleSocialSuccess}
                        />

                        {/* Top-level form error */}
                        {error && (
                            <div className="mt-4 space-y-2">
                                <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                                    {error}
                                </p>
                                {needsEmailVerification ? (
                                    <Link
                                        href={verificationHref}
                                        className="inline-flex text-sm font-medium text-primary hover:underline"
                                    >
                                        Enter verification code →
                                    </Link>
                                ) : null}
                            </div>
                        )}
                        {success && (
                            <p role="status" className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                                {success}
                            </p>
                        )}

                        {/* Separator before email/password */}
                        <div className="relative mt-5">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/60" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-card px-3 text-muted-foreground font-medium">or sign in with email</span>
                            </div>
                        </div>

                        <div className="mt-5 mb-5">
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                {t("auth.email")}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${fieldErrors.email ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'}`}
                                autoComplete="email"
                                disabled={isLoading}
                                required
                                aria-invalid={Boolean(fieldErrors.email)}
                                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                            />
                            {fieldErrors.email && (
                                <p id="login-email-error" className="mt-2 text-sm text-destructive">
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                {t("auth.password")}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`mt-2 w-full rounded-xl border bg-background px-4 py-3 text-foreground shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${fieldErrors.password ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'}`}
                                autoComplete="current-password"
                                disabled={isLoading}
                                required
                                aria-invalid={Boolean(fieldErrors.password)}
                                aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                            />
                            {fieldErrors.password && (
                                <p id="login-password-error" className="mt-2 text-sm text-destructive">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </div>

                        <div className="mb-6 flex items-center justify-between gap-4">
                            <label className="flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="h-4 w-4 rounded border-input"
                                    disabled={isLoading}
                                />
                                {t("auth.rememberMe")}
                            </label>

                            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                {t("auth.forgotPassword")}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? t("auth.signingIn") : t("auth.signInAndContinue")}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </button>


                        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                            <Link
                                href={`/auth/register?intent=${intent}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                                className="text-primary hover:underline"
                            >
                                {t("auth.createNewAccount")}
                            </Link>
                            <span className="text-muted-foreground">
                                {t("auth.intentSaved")} <span className="font-medium text-foreground">{t(selectedIntentConfig.labelKey)}</span>
                            </span>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;
