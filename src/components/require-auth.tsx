import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/use-session";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, hydrated } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) {
      const timer = setTimeout(() => navigate({ to: "/auth/login" }), 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hydrated, user, navigate]);

  if (!hydrated) return <Skeleton className="h-64 rounded-xl" />;

  if (!user) {
    return (
      <div className="card-surface rounded-xl px-6 py-14 text-center">
        <h1 className="font-display text-xl font-bold">Please sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This area needs an account. Taking you to sign in…
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
