import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { ApiErrorState } from "@/components/api-error-state";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { ShowPoster } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bookingsApi, showsApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/account/tickets/$reference")({
  ssr: false,
  head: () => ({ meta: [{ title: "Booking details — TicketNest" }] }),
  component: TicketPage,
});

function TicketPage() {
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

  if (booking.isPending) return <Skeleton className="h-72 rounded-xl" />;
  if (booking.isError)
    return <ApiErrorState error={booking.error} onRetry={() => booking.refetch()} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Booking details</h1>
      <div className="card-surface mt-4 overflow-hidden rounded-2xl md:flex">
        <ShowPoster
          seed={booking.data.showId + (show.data?.title ?? "event")}
          title={show.data?.genre ?? "Event"}
          className="h-48 w-full md:h-auto md:w-56"
        />
        <div className="flex-1 space-y-4 p-6">
          <div>
            <h2 className="font-display text-xl font-bold">{show.data?.title ?? "Event"}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(show.data?.startTime)} · {formatTime(show.data?.startTime)}
            </p>
            <p className="text-sm text-muted-foreground">Status: {booking.data.status}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Row / seats</p>
              <p className="font-medium">
                {booking.data.seats.map((seat) => `${seat.row}${seat.number}`).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Expires</p>
              <p className="font-medium">
                {formatDate(booking.data.expiresAt)} {formatTime(booking.data.expiresAt)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Amount</p>
              <p className="font-medium">
                {formatMoney(booking.data.totalAmount, booking.data.currency)}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs uppercase text-muted-foreground">Booking ID</p>
            <p className="break-all font-display text-base font-bold">{booking.data.id}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <PendingBackendNote>
          The backend currently creates seat holds. A scannable entry ticket will become available
          after payment confirmation is implemented.
        </PendingBackendNote>
      </div>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/account/bookings">Back to bookings</Link>
      </Button>
    </div>
  );
}
