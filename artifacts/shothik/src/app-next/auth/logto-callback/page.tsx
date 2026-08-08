import { useHandleSignInCallback } from "@logto/react";
import { useLocation } from "wouter";
import { logtoEnabled } from "@/providers/LogtoAuthProvider";

function LogtoCallbackInner() {
  const [, navigate] = useLocation();
  const { isLoading, error } = useHandleSignInCallback(() => {
    navigate("/auth/post-login", { replace: true });
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      {error ? (
        <>
          <p className="text-sm text-destructive">Sign-in failed: {error.message}</p>
          <a href="auth/login" className="text-sm text-primary hover:underline">
            Back to login
          </a>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Completing sign-in…" : "Redirecting…"}
        </p>
      )}
    </div>
  );
}

export default function LogtoCallbackPage() {
  if (!logtoEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Logto sign-in is not configured.
      </div>
    );
  }
  return <LogtoCallbackInner />;
}
