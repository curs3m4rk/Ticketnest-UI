import { createFileRoute, Link } from "@tanstack/react-router";

import { PendingBackendNote } from "@/components/pending-backend-note";
import { ShowPoster } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/lib/booking-store";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/account/tickets/$reference")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My ticket — TicketNest" },
      {
        name: "description",
        content: "Your entry ticket with seat, gate and booking reference.",
      },
      { property: "og:title", content: "My ticket — TicketNest" },
      {
        property: "og:description",
        content: "Your entry ticket with seat, gate and booking reference.",
      },
    ],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { reference } = Route.useParams();
  const booking = useBookings().find((b) => b.reference === reference);

  if (!booking) {
    return (
      <div className="card-surface rounded-xl px-6 py-14 text-center">
        <h1 className="font-display text-xl font-bold">Ticket not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This ticket isn't stored in this browser.
        </p>
        <Button asChild className="mt-4">
          <Link to="/account/bookings">Back to my bookings</Link>
        </Button>
      </div>
    );
  }

  const seats = booking.seats;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My ticket</h1>

      <div className="card-surface mt-4 overflow-hidden rounded-2xl md:flex">
        <ShowPoster
          seed={booking.showId + booking.showTitle}
          title={booking.genre}
          className="h-48 w-full md:h-auto md:w-56"
        />
        <div className="flex-1 space-y-4 p-6">
          <div>
            <h2 className="font-display text-xl font-bold">{booking.showTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.venueName}, {booking.venueCity}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Row / seats</p>
              <p className="font-medium">
                {seats.map((s) => `${s.row}${s.number}`).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Seat type</p>
              <p className="font-medium">{seats[0]?.tier ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Amount paid</p>
              <p className="font-medium">{formatMoney(booking.total)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs uppercase text-muted-foreground">Booking ID</p>
            <p className="font-display text-lg font-bold">{booking.reference}</p>
            <div className="mt-3 flex h-12 items-end gap-[2px]" aria-hidden="true">
              {booking.reference.split("").flatMap((ch, i) =>
                Array.from({ length: 3 }).map((_, j) => (
                  <span
                    key={`${i}-${j}`}
                    className="w-[3px] bg-foreground"
                    style={{
                      height: `${40 + ((ch.charCodeAt(0) * (j + 2)) % 60)}%`,
                    }}
                  />
                )),
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Show this reference at the entry gate.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PendingBackendNote>
          A real scannable ticket needs a ticketing endpoint on your API — this
          barcode is decorative for now.
        </PendingBackendNote>
      </div>
    </div>
  );
}
