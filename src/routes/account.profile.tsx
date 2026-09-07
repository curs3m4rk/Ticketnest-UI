import { createFileRoute } from "@tanstack/react-router";

import { PendingBackendNote } from "@/components/pending-backend-note";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initials } from "@/lib/format";
import { useSession } from "@/lib/use-session";

export const Route = createFileRoute("/account/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profile — TicketNest" },
      {
        name: "description",
        content: "Your TicketNest account details and assigned roles.",
      },
      { property: "og:title", content: "Profile — TicketNest" },
      { property: "og:description", content: "Your account details and roles." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useSession();
  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div className="card-surface space-y-4 rounded-xl p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={user.firstName ?? ""} readOnly />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={user.lastName ?? ""} readOnly />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={user.phoneNumber ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              {user.roles.length ? (
                user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No roles assigned</span>
              )}
            </div>
          </div>
          <PendingBackendNote>
            These details are read-only: your API has no endpoint for updating a
            profile or changing a password yet.
          </PendingBackendNote>
        </div>

        <div className="card-surface flex flex-col items-center gap-3 rounded-xl p-6">
          <span className="flex size-24 items-center justify-center rounded-full bg-accent font-display text-2xl font-bold text-accent-foreground">
            {initials(user.firstName, user.lastName, user.email)}
          </span>
          <p className="text-sm font-medium">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
