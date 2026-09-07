import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/account/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/account/bookings" });
  },
});
