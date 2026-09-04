import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/endpoints";
import { saveLogin } from "@/lib/api/session";

export const Route = createFileRoute("/auth/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — TicketNest" },
      {
        name: "description",
        content: "Sign in to TicketNest to book seats and see your bookings.",
      },
      { property: "og:title", content: "Sign in — TicketNest" },
      {
        property: "og:description",
        content: "Sign in to book seats and see your bookings.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "" });

  const login = useMutation({
    mutationFn: () => authApi.login(form),
    onSuccess: (data) => {
      saveLogin(data);
      queryClient.invalidateQueries();
      toast.success(`Welcome back, ${data.firstName ?? data.email}`);
      navigate({ to: "/", replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="hero-surface flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-card p-7 text-card-foreground shadow-[var(--shadow-lift)]">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="gradient-primary flex size-8 items-center justify-center rounded-lg">
            <Ticket className="size-4 text-primary-foreground" />
          </span>
          TicketNest
        </Link>
        <h1 className="mt-6 font-display text-xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use the email and password you registered with.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/auth/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
