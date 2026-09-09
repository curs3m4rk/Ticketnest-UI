import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/page-shell";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cartSubtotal, setCart, useCart } from "@/lib/booking-store";
import { bookingsApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import { useSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Checkout — TicketNest" },
      {
        name: "description",
        content: "Review your details and hold selected seats.",
      },
      { property: "og:title", content: "Checkout — TicketNest" },
      {
        property: "og:description",
        content: "Review your details and hold selected seats.",
      },
    ],
  }),
  component: CheckoutPage,
});

function Step({
  index,
  title,
  open,
  onOpen,
  done,
  children,
}: {
  index: number;
  title: string;
  open: boolean;
  onOpen: () => void;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-medium">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
              done ? "bg-success text-success-foreground" : "bg-accent text-accent-foreground",
            )}
          >
            {done ? <Check className="size-3.5" /> : index}
          </span>
          {title}
        </span>
      </button>
      {open ? <div className="border-t px-5 py-4">{children}</div> : null}
    </section>
  );
}

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const filled = {
    fullName: contact.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: contact.email || user?.email || "",
    phone: contact.phone || user?.phoneNumber || "",
  };

  const subtotal = cartSubtotal(cart);
  const contactValid =
    filled.fullName.trim().length > 1 &&
    /.+@.+\..+/.test(filled.email) &&
    filled.phone.trim().length >= 8;

  const createBooking = useMutation({
    mutationFn: () =>
      bookingsApi.create(
        { showId: cart!.showId, showSeatIds: cart!.seats.map((seat) => seat.id) },
        idempotencyKey,
      ),
    onSuccess: (booking) => {
      setCart(null);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["show-seats", booking.showId] });
      navigate({
        to: "/confirmation/$reference",
        params: { reference: booking.id },
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function pay() {
    if (!user) {
      toast.error("Sign in before holding your seats");
      navigate({ to: "/auth/login" });
      return;
    }
    createBooking.mutate();
  }

  if (!cart || !cart.seats.length) {
    return (
      <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Checkout" }]}>
        <div className="card-surface rounded-xl px-6 py-14 text-center">
          <h1 className="font-display text-xl font-bold">Nothing to check out</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick some seats first and they'll show up here.
          </p>
          <Button asChild className="mt-4">
            <Link to="/shows">Browse events</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Your cart", to: "/cart" },
        { label: "Checkout" },
      ]}
    >
      <h1 className="font-display text-2xl font-bold">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-3">
          <Step
            index={1}
            title="Contact details"
            open={step === 1}
            onOpen={() => setStep(1)}
            done={step > 1 && contactValid}
          >
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={filled.fullName}
                  onChange={(e) => setContact((c) => ({ ...c, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={filled.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={filled.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                />
              </div>
              <Button
                className="justify-self-start"
                disabled={!contactValid}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          </Step>

          <Step
            index={2}
            title="Review & hold"
            open={step === 2}
            onOpen={() => contactValid && setStep(2)}
            done={false}
          >
            <div className="space-y-2 text-sm">
              <p className="font-medium">{cart.showTitle}</p>
              <p className="text-muted-foreground">
                {formatDate(cart.startTime)} · {formatTime(cart.startTime)} · {cart.venueName},{" "}
                {cart.venueCity}
              </p>
              <p className="text-muted-foreground">
                {cart.seats.map((s) => `${s.row}${s.number}`).join(", ")} · {cart.seats.length}{" "}
                ticket(s)
              </p>
              <p className="text-muted-foreground">Account: {filled.email}</p>
              <Button className="mt-2 w-full" disabled={createBooking.isPending} onClick={pay}>
                {createBooking.isPending
                  ? "Holding seats…"
                  : `Hold seats for ${formatMoney(subtotal, cart.currency)}`}
              </Button>
            </div>
          </Step>
        </div>

        <aside className="space-y-4">
          <div className="card-surface space-y-3 rounded-xl p-5 text-sm">
            <h2 className="font-semibold">Seat hold</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tickets</span>
              <span>{formatMoney(subtotal, cart.currency)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total amount</span>
              <span>{formatMoney(subtotal, cart.currency)}</span>
            </div>
          </div>
          <PendingBackendNote>
            The API creates a temporary seat hold, not a payment. Complete the payment flow after a
            payment endpoint is added; otherwise the hold expires automatically.
          </PendingBackendNote>
        </aside>
      </div>
    </PageShell>
  );
}
