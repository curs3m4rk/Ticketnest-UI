import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { ShowPoster } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { cartSubtotal, setCart, useCart } from "@/lib/booking-store";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your cart — TicketNest" },
      {
        name: "description",
        content: "Review the seats you picked before heading to checkout.",
      },
      { property: "og:title", content: "Your cart — TicketNest" },
      {
        property: "og:description",
        content: "Review the seats you picked before checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const subtotal = cartSubtotal(cart);

  return (
    <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Your cart" }]}>
      <h1 className="font-display text-2xl font-bold">Your cart</h1>

      {!cart || !cart.seats.length ? (
        <div className="card-surface mt-6 rounded-xl px-6 py-14 text-center">
          <h2 className="font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find an event and pick your seats to get started.
          </p>
          <Button asChild className="mt-4">
            <Link to="/shows">Browse events</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="card-surface rounded-xl p-5">
            <div className="flex gap-4">
              <ShowPoster
                seed={cart.showId + cart.showTitle}
                title={cart.genre}
                className="h-24 w-20 shrink-0 overflow-hidden rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{cart.showTitle}</h2>
                <p className="text-xs text-muted-foreground">
                  {formatDate(cart.startTime)} · {formatTime(cart.startTime)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {cart.venueName}, {cart.venueCity}
                </p>
                <p className="mt-2 text-xs">
                  {cart.seats.map((s) => `${s.tier} · Row ${s.row}, ${s.number}`).join(" | ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{cart.seats.length} ticket(s)</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-semibold">{formatMoney(subtotal, cart.currency)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove from cart"
                  onClick={() => setCart(null)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card-surface space-y-3 rounded-xl p-5 text-sm">
              <h2 className="font-semibold">Price details</h2>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tickets ({cart.seats.length})</span>
                <span>{formatMoney(subtotal, cart.currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total amount</span>
                <span>{formatMoney(subtotal, cart.currency)}</span>
              </div>
              <Button className="w-full" onClick={() => navigate({ to: "/checkout" })}>
                Proceed to checkout
              </Button>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
