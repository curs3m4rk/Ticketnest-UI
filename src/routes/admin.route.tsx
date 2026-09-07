import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building2, CalendarRange, ShieldCheck, Users } from "lucide-react";

import { ConsoleShell } from "@/components/console-shell";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <ConsoleShell
      title="Admin console"
      items={[
        {
          to: "/admin/shows",
          label: "Shows",
          icon: <CalendarRange className="size-4" />,
        },
        { to: "/admin/venues", label: "Venues", icon: <Building2 className="size-4" /> },
        { to: "/admin/roles", label: "Roles", icon: <ShieldCheck className="size-4" /> },
        { to: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
      ]}
    >
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    </ConsoleShell>
  );
}
