

import React, { useState } from 'react';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { Link } from 'wouter';
import { ArrowRight, BookOpen, FilePenLine, FlaskConical, Layers3, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from '@/i18n';
import { normalizeAuthIntent } from '@/lib/auth-flow';

const INTENT_OPTIONS = {
  continue: {
    titleKey: 'auth.intent.continueTitle',
    descriptionKey: 'auth.intent.continueDescriptionRegister',
    icon: Layers3,
  },
  writing_studio: {
    titleKey: 'auth.intent.writingStudioTitle',
    descriptionKey: 'auth.intent.writingStudioDescriptionRegister',
    icon: Sparkles,
  },
  research: {
    titleKey: 'auth.intent.researchTitle',
    descriptionKey: 'auth.intent.researchDescriptionRegister',
    icon: FlaskConical,
  },
  assignment: {
    titleKey: 'auth.intent.assignmentTitle',
    descriptionKey: 'auth.intent.assignmentDescriptionRegister',
    icon: FilePenLine,
  },
  twin: {
    titleKey: 'auth.intent.twinTitle',
    descriptionKey: 'auth.intent.twinDescriptionRegister',
    icon: BookOpen,
  },
};

const RegisterPage = () => {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initialIntent = normalizeAuthIntent(searchParams.get("intent"));
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'Bangladesh',
    intent: initialIntent,
    terms: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVerifyLink, setShowVerifyLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationHref = `/auth/verify-email?email=${encodeURIComponent(formState.email.trim())}`;

  const selectedIntentConfig = INTENT_OPTIONS[formState.intent];
  const SelectedIntentIcon = selectedIntentConfig.icon;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setShowVerifyLink(false);

    const data = {
      ...formState,
      intent: normalizeAuthIntent(formState.intent),
    };
    const nextErrors: Record<string, string> = {};

    if (!data.name.trim()) nextErrors.name = t('auth.messages.nameRequired');
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) nextErrors.email = t('auth.messages.invalidEmail');
    if (data.password.length < 6) nextErrors.password = t('auth.messages.passwordTooShort');
    if (data.password !== data.confirmPassword) nextErrors.confirmPassword = t('auth.messages.passwordsDoNotMatch');
    if (!data.terms) nextErrors.terms = t('auth.messages.mustAgreeTerms');

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(t('auth.messages.fixHighlighted'));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await register(data.name, data.email, data.password, data.country);

      if (result.requiresEmailVerification) {
        setSuccess(t('auth.messages.accountCreatedVerify'));
        setShowVerifyLink(true);
        setIsSubmitting(false);
        return;
      }

      setSuccess(t('auth.messages.registrationSuccessRedirect'));
      router.push(`/auth/login?intent=${data.intent}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.messages.registrationFailed'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between border-b border-border px-6 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              {t('auth.createWorkspaceBadge')}
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              {t('auth.registerHeadline')}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
              {t('auth.registerSubheadline')}
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border bg-card/80 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10">
                <SelectedIntentIcon className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t('auth.firstRunRecommendation')}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{t(selectedIntentConfig.titleKey)}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(selectedIntentConfig.descriptionKey)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-12 lg:py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-8">
              <p className="text-sm font-medium text-brand">{t('auth.createYourAccount')}</p>
              <h2 className="mt-2 text-3xl font-bold text-foreground">{t('auth.setUpYourWorkspace')}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t('auth.registerDescription')}
              </p>
            </div>

            {/* Guest Quick-Access Bypass (Relaxed Auth Requirement) */}
            <div className="mb-6">
              <Link
                href="/agents/chat"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-brand/40 bg-brand/10 hover:bg-brand/20 text-brand font-semibold text-sm transition cursor-pointer shadow-xs"
              >
                <span>⚡ Continue as Guest (লগইন ছাড়া প্রবেশ করুন)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mb-5">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">{t('auth.name')}</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'register-name-error' : undefined}
                className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {fieldErrors.name && <p id="register-name-error" className="mt-2 text-sm text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">{t('auth.email')}</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formState.email}
                onChange={(e) => setFormState((prev) => ({ ...prev, email: e.target.value }))}
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
                className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {fieldErrors.email && <p id="register-email-error" className="mt-2 text-sm text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">{t('auth.password')}</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formState.password}
                  onChange={(e) => setFormState((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
                  className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.password && <p id="register-password-error" className="mt-2 text-sm text-destructive">{fieldErrors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">{t('auth.confirmPassword')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formState.confirmPassword}
                  onChange={(e) => setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
                  className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {fieldErrors.confirmPassword && (
                  <p id="register-confirm-password-error" className="mt-2 text-sm text-destructive">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="country" className="block text-sm font-medium text-foreground">{t('auth.country')}</label>
              <select
                name="country"
                id="country"
                value={formState.country}
                onChange={(e) => setFormState((prev) => ({ ...prev, country: e.target.value }))}
                className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="Bangladesh">Bangladesh</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
              </select>
            </div>

            <div className="mt-5">
              <label htmlFor="intent" className="block text-sm font-medium text-foreground">{t('auth.whatDoYouWantFirst')}</label>
              <select
                name="intent"
                id="intent"
                value={formState.intent}
                onChange={(e) => setFormState((prev) => ({ ...prev, intent: normalizeAuthIntent(e.target.value) }))}
                className="mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="continue">{t('auth.intent.continueTitle')}</option>
                <option value="writing_studio">{t('auth.intent.writingStudioTitle')}</option>
                <option value="research">{t('auth.intent.researchTitle')}</option>
                <option value="assignment">{t('auth.intent.assignmentTitle')}</option>
                <option value="twin">{t('auth.intent.twinTitle')}</option>
              </select>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="inline-flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formState.terms}
                  onChange={(e) => setFormState((prev) => ({ ...prev, terms: e.target.checked }))}
                  className="mt-1 rounded border-input text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary/30"
                  aria-invalid={Boolean(fieldErrors.terms)}
                  aria-describedby={fieldErrors.terms ? 'register-terms-error' : undefined}
                />
                <label htmlFor="terms" className="text-sm text-foreground">
                  {t('auth.termsAgreement')}
                </label>
              </div>
              {fieldErrors.terms && <p id="register-terms-error" className="mt-2 text-sm text-destructive">{fieldErrors.terms}</p>}
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            {success && (
              <div className="mt-4 space-y-3">
                <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
                  {success}
                </p>
                {showVerifyLink ? (
                  <Link href={verificationHref} className="inline-flex text-sm font-medium text-primary hover:underline">
                    {t('auth.enterVerificationCode')}
                  </Link>
                ) : null}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccount')}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
              <Link href={`/auth/login?intent=${formState.intent}`} className="text-primary hover:text-primary/80">
                {t('auth.alreadyHaveAccount')}
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
