import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/endpoints";
import { saveLogin } from "@/lib/api/session";

export const Route = createFileRoute("/auth/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your account — TicketNest" },
      {
        name: "description",
        content: "Create a TicketNest account to book seats for live events.",
      },
      { property: "og:title", content: "Create your account — TicketNest" },
      {
        property: "og:description",
        content: "Create an account to book seats for live events.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const register = useMutation({
    mutationFn: async () => {
      await authApi.register(form);
      return authApi.login({ email: form.email, password: form.password });
    },
    onSuccess: (login) => {
      saveLogin(login);
      toast.success("Account created — you're signed in");
      navigate({ to: "/", replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="hero-surface flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card p-7 text-card-foreground shadow-[var(--shadow-lift)]">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="gradient-primary flex size-8 items-center justify-center rounded-lg">
            <Ticket className="size-4 text-primary-foreground" />
          </span>
          TicketNest
        </Link>
        <h1 className="mt-6 font-display text-xl font-bold">Create your account</h1>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            register.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                minLength={2}
                maxLength={50}
                value={form.firstName}
                onChange={set("firstName")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                minLength={2}
                maxLength={50}
                value={form.lastName}
                onChange={set("lastName")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone</Label>
            <Input
              id="phoneNumber"
              required
              placeholder="+919876543210"
              pattern="^\+[1-9]\d{7,14}$"
              value={form.phoneNumber}
              onChange={set("phoneNumber")}
            />
            <p className="text-xs text-muted-foreground">
              Include the country code, e.g. +919876543210.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
