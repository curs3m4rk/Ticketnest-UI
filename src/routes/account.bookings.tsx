import { createFileRoute, Link } from "@tanstack/react-router";

import { PendingBackendNote } from "@/components/pending-backend-note";
import { ShowPoster } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cancelBooking, useBookings, type Booking } from "@/lib/booking-store";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/account/bookings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My bookings — TicketNest" },
      {
        name: "description",
        content: "Every event you've booked on TicketNest, with tickets and references.",
      },
      { property: "og:title", content: "My bookings — TicketNest" },
      {
        property: "og:description",
        content: "Every event you've booked, with tickets and references.",
      },
    ],
  }),
  component: BookingsPage,
});

function isPast(booking: Booking) {
  const t = new Date(booking.startTime).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <article className="card-surface flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
      <ShowPoster
        seed={booking.showId + booking.showTitle}
        title={booking.genre}
        className="h-20 w-full shrink-0 overflow-hidden rounded-lg sm:w-24"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold">{booking.showTitle}</h2>
        <p className="text-xs text-muted-foreground">
          {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
        </p>
        <p className="text-xs text-muted-foreground">
          {booking.venueName}, {booking.venueCity}
        </p>
        <p className="mt-1 text-xs">
          {booking.seats.map((s) => `${s.tier} · ${s.row}${s.number}`).join(" | ")}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="text-xs text-muted-foreground">
          Booking ID
          <br />
          <span className="font-medium text-foreground">{booking.reference}</span>
        </p>
        <p className="text-sm font-semibold">{formatMoney(booking.total)}</p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link
              to="/account/tickets/$reference"
              params={{ reference: booking.reference }}
            >
              View ticket
            </Link>
          </Button>
          {booking.status === "UPCOMING" && !isPast(booking) ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => cancelBooking(booking.reference)}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BookingsPage() {
  const bookings = useBookings();
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");
  const active = bookings.filter((b) => b.status !== "CANCELLED");
  const upcoming = active.filter((b) => !isPast(b));
  const completed = active.filter(isPast);

  const groups: Array<[string, string, Booking[]]> = [
    ["upcoming", "Upcoming", upcoming],
    ["completed", "Completed", completed],
    ["cancelled", "Cancelled", cancelled],
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My bookings</h1>

      <Tabs defaultValue="upcoming" className="mt-4">
        <TabsList>
          {groups.map(([value, label, list]) => (
            <TabsTrigger key={value} value={value}>
              {label} ({list.length})
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map(([value, label, list]) => (
          <TabsContent key={value} value={value} className="space-y-3">
            {list.length ? (
              list.map((booking) => (
                <BookingRow key={booking.reference} booking={booking} />
              ))
            ) : (
              <div className="card-surface rounded-xl px-6 py-12 text-center">
                <h2 className="font-semibold">No {label.toLowerCase()} bookings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Book an event and it will show up here.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/shows">Browse events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-4">
        <PendingBackendNote>
          Bookings are saved in this browser only, so they won't appear on another
          device until your API gains booking endpoints.
        </PendingBackendNote>
      </div>
    </div>
  );
}
