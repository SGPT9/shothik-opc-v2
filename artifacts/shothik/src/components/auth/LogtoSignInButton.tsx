import { useLogto } from "@logto/react";
import { logtoEnabled, logtoCallbackUri } from "@/providers/LogtoAuthProvider";

function LogtoButtonInner() {
  const { signIn, isAuthenticated } = useLogto();
  if (isAuthenticated) return null;
  return (
    <button
      type="button"
      onClick={() => signIn(logtoCallbackUri())}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Sign in with Shothik ID
    </button>
  );
}

/** Renders nothing unless Logto is configured (VITE_LOGTO_ENDPOINT + VITE_LOGTO_APP_ID). */
export default function LogtoSignInButton() {
  if (!logtoEnabled) return null;
  return <LogtoButtonInner />;
}
