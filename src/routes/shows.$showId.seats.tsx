import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { SeatMap } from "@/components/seat-map";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showsApi, venuesApi } from "@/lib/api/endpoints";
import { setCart, type CartSeat } from "@/lib/booking-store";
import { formatMoney, tierPrice } from "@/lib/format";
import type { SeatResponse } from "@/lib/api/types";

export const Route = createFileRoute("/shows/$showId/seats")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Select your seats — TicketNest" },
      {
        name: "description",
        content:
          "Pick your row and seat on the venue seat map and see your total update as you go.",
      },
      { property: "og:title", content: "Select your seats — TicketNest" },
      {
        property: "og:description",
        content: "Pick your row and seat on the venue seat map.",
      },
    ],
  }),
  component: SeatSelectionPage,
});

function SeatSelectionPage() {
  const { showId } = Route.useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SeatResponse[]>([]);

  const show = useQuery({
    queryKey: ["show", showId],
    queryFn: () => showsApi.get(showId),
  });

  const venueId = show.data?.venue?.id;

  const seats = useQuery({
    queryKey: ["venue-seats", venueId],
    queryFn: () => venuesApi.seats(venueId!),
    enabled: Boolean(venueId),
  });

  function toggle(seat: SeatResponse) {
    setSelected((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat],
    );
  }

  const cartSeats: CartSeat[] = selected.map((s) => ({
    id: s.id,
    row: s.row,
    number: s.number,
    tier: s.tier,
    price: tierPrice(s.tier),
  }));
  const total = cartSeats.reduce((sum, s) => sum + s.price, 0);

  function addToCart() {
    const data = show.data;
    if (!data?.venue || !cartSeats.length) return;
    setCart({
      showId: data.id,
      showTitle: data.title,
      genre: data.genre,
      startTime: data.startTime,
      venueId: data.venue.id,
      venueName: data.venue.name,
      venueCity: data.venue.city,
      seats: cartSeats,
    });
    toast.success(`${cartSeats.length} seat(s) added`);
    navigate({ to: "/cart" });
  }

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Events", to: "/shows" },
        { label: show.data?.title ?? "Event", to: "/shows/$showId", params: { showId } },
        { label: "Select seats" },
      ]}
    >
      <h1 className="font-display text-2xl font-bold">Select your seats</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {show.data?.title} · {show.data?.venue?.name}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="card-surface rounded-xl p-5">
          {show.isPending || seats.isPending ? (
            <Skeleton className="h-72 rounded-lg" />
          ) : show.isError ? (
            <ApiErrorState error={show.error} onRetry={() => show.refetch()} />
          ) : !venueId ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              This event has no venue assigned, so there is no seat map yet.
            </p>
          ) : seats.isError ? (
            <ApiErrorState error={seats.error} onRetry={() => seats.refetch()} />
          ) : seats.data?.length ? (
            <SeatMap
              seats={seats.data}
              selectedIds={selected.map((s) => s.id)}
              onToggle={toggle}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No seats have been created for this venue yet.
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-surface space-y-4 rounded-xl p-5">
            <h2 className="font-semibold">Your selection</h2>
            {cartSeats.length ? (
              <ul className="space-y-2 text-sm">
                {cartSeats.map((seat) => (
                  <li key={seat.id} className="flex justify-between">
                    <span>
                      {seat.tier} · Row {seat.row}, seat {seat.number}
                    </span>
                    <span className="font-medium">{formatMoney(seat.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap seats on the map to add them here.
              </p>
            )}
            <div className="flex items-center justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
            <Button className="w-full" disabled={!cartSeats.length} onClick={addToCart}>
              Add to cart
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate({ to: "/shows/$showId", params: { showId } })}
            >
              Back
            </Button>
          </div>
          <PendingBackendNote>
            Seats come from your venue API. Availability, holds and payment are not
            in the API yet, so every seat shows as available and the cart lives in
            this browser only.
          </PendingBackendNote>
        </aside>
      </div>
    </PageShell>
  );
}
