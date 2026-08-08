

import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "@/lib/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface AuthWrapperProps {
  readonly children: React.ReactNode;
  readonly redirect?: string;
}

const AuthWrapper = ({ children, redirect }: AuthWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const redirectPath = redirect || searchParams.get("redirect") || "/";

      // Add current path as query parameter
      const path = pathname || "/";
      const separator = redirectPath.includes("?") ? "&" : "?";
      const redirectTo = `${redirectPath}${separator}from=${encodeURIComponent(path)}`;

      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirect, router, searchParams, pathname]);

  // If loading, don't render children (will show loader)
  if (isLoading || !isAuthenticated) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-3rem)] items-center justify-center lg:min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading accounts...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default AuthWrapper;
