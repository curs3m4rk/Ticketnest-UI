import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/lib/booking-store";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/confirmation/$reference")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Booking confirmed — TicketNest" },
      {
        name: "description",
        content: "Your seats are confirmed. Keep your booking reference handy.",
      },
      { property: "og:title", content: "Booking confirmed — TicketNest" },
      { property: "og:description", content: "Your seats are confirmed." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { reference } = Route.useParams();
  const booking = useBookings().find((b) => b.reference === reference);

  return (
    <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Confirmation" }]}>
      <div className="card-surface mx-auto max-w-lg rounded-xl px-6 py-12 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">Booking confirmed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {booking
            ? "Your seats are held against the reference below."
            : "We couldn't find that booking in this browser."}
        </p>

        {booking ? (
          <>
            <div className="mt-6 rounded-xl bg-accent/50 px-4 py-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Booking ID
              </p>
              <p className="mt-1 font-display text-xl font-bold">{booking.reference}</p>
            </div>
            <div className="mt-5 space-y-1 text-sm">
              <p className="font-medium">{booking.showTitle}</p>
              <p className="text-muted-foreground">
                {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
              </p>
              <p className="text-muted-foreground">
                {booking.venueName}, {booking.venueCity}
              </p>
              <p className="text-muted-foreground">
                {booking.seats.map((s) => `${s.row}${s.number}`).join(", ")} ·{" "}
                {formatMoney(booking.total)}
              </p>
            </div>
          </>
        ) : null}

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
            This confirmation is generated locally. Once your API has booking
            endpoints, references will come from the server and tickets will be
            emailed.
          </PendingBackendNote>
        </div>
      </div>
    </PageShell>
  );
}
