import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CreditCard, Ticket, User } from "lucide-react";

import { ConsoleShell } from "@/components/console-shell";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/account")({
  ssr: false,
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <ConsoleShell
      title="My account"
      items={[
        {
          to: "/account/bookings",
          label: "My bookings",
          icon: <Ticket className="size-4" />,
        },
        { to: "/account/profile", label: "Profile", icon: <User className="size-4" /> },
        {
          to: "/account/payment-methods",
          label: "Payment methods",
          icon: <CreditCard className="size-4" />,
        },
      ]}
    >
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    </ConsoleShell>
  );
}
