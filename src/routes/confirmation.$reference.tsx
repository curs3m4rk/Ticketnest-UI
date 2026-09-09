import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingsApi, showsApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/confirmation/$reference")({
  ssr: false,
  head: () => ({ meta: [{ title: "Seats held — TicketNest" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { reference } = Route.useParams();
  const booking = useQuery({
    queryKey: ["booking", reference],
    queryFn: () => bookingsApi.get(reference),
  });
  const show = useQuery({
    queryKey: ["show", booking.data?.showId],
    queryFn: () => showsApi.get(booking.data!.showId),
    enabled: Boolean(booking.data?.showId),
  });

  return (
    <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Seat hold" }]}>
      <div className="card-surface mx-auto max-w-lg rounded-xl px-6 py-12 text-center">
        {booking.isPending ? (
          <Skeleton className="mx-auto h-64 w-full" />
        ) : booking.isError ? (
          <ApiErrorState error={booking.error} onRetry={() => booking.refetch()} />
        ) : (
          <>
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold">Seats held!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your hold expires {formatDate(booking.data.expiresAt)} at{" "}
              {formatTime(booking.data.expiresAt)}.
            </p>
            <div className="mt-6 rounded-xl bg-accent/50 px-4 py-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Booking ID</p>
              <p className="mt-1 break-all font-display text-lg font-bold">{booking.data.id}</p>
            </div>
            <div className="mt-5 space-y-1 text-sm">
              <p className="font-medium">{show.data?.title ?? "Event"}</p>
              <p className="text-muted-foreground">
                {booking.data.seats.map((seat) => `${seat.row}${seat.number}`).join(", ")} ·{" "}
                {formatMoney(booking.data.totalAmount, booking.data.currency)}
              </p>
              <p className="text-muted-foreground">Status: {booking.data.status}</p>
            </div>
          </>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link to="/account/bookings">View my bookings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
        <div className="mt-6 text-left">
          <PendingBackendNote>
            Payment confirmation is not implemented by the backend yet. This is a temporary seat
            hold and will expire automatically.
          </PendingBackendNote>
        </div>
      </div>
    </PageShell>
  );
}
