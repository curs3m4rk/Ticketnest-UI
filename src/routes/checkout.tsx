import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { PendingBackendNote } from "@/components/pending-backend-note";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BOOKING_FEE,
  cartSubtotal,
  confirmBooking,
  useCart,
} from "@/lib/booking-store";
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
        content: "Confirm your contact details and payment method to book your seats.",
      },
      { property: "og:title", content: "Checkout — TicketNest" },
      {
        property: "og:description",
        content: "Confirm your details and payment method to book your seats.",
      },
    ],
  }),
  component: CheckoutPage,
});

const METHODS = [
  { id: "UPI", label: "UPI", hint: "Pay using any UPI app", icon: Smartphone },
  {
    id: "CARD",
    label: "Credit / Debit card",
    hint: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  { id: "NETBANKING", label: "Net banking", hint: "All major banks", icon: Landmark },
  { id: "WALLET", label: "Wallets", hint: "Paytm, PhonePe, Amazon Pay", icon: Wallet },
];

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
  const { user } = useSession();
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [method, setMethod] = useState("UPI");

  const filled = {
    fullName: contact.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    email: contact.email || user?.email || "",
    phone: contact.phone || user?.phoneNumber || "",
  };

  const subtotal = cartSubtotal(cart);
  const total = subtotal ? subtotal + BOOKING_FEE : 0;
  const contactValid =
    filled.fullName.trim().length > 1 &&
    /.+@.+\..+/.test(filled.email) &&
    filled.phone.trim().length >= 8;

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

  function pay() {
    const booking = confirmBooking(cart!, filled, method);
    navigate({ to: "/confirmation/$reference", params: { reference: booking.reference } });
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
                  onChange={(e) =>
                    setContact((c) => ({ ...c, fullName: e.target.value }))
                  }
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
            title="Payment"
            open={step === 2}
            onOpen={() => contactValid && setStep(2)}
            done={step > 2}
          >
            <div className="space-y-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                      method === m.id
                        ? "border-primary bg-accent/60"
                        : "hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4 text-primary" />
                    <span>
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {m.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
              <Button className="mt-2" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </Step>

          <Step
            index={3}
            title="Review & confirm"
            open={step === 3}
            onOpen={() => contactValid && setStep(3)}
            done={false}
          >
            <div className="space-y-2 text-sm">
              <p className="font-medium">{cart.showTitle}</p>
              <p className="text-muted-foreground">
                {formatDate(cart.startTime)} · {formatTime(cart.startTime)} ·{" "}
                {cart.venueName}, {cart.venueCity}
              </p>
              <p className="text-muted-foreground">
                {cart.seats.map((s) => `${s.row}${s.number}`).join(", ")} ·{" "}
                {cart.seats.length} ticket(s)
              </p>
              <p className="text-muted-foreground">
                Paying with {METHODS.find((m) => m.id === method)?.label} ·{" "}
                {filled.email}
              </p>
              <Button className="mt-2 w-full" onClick={pay}>
                Pay {formatMoney(total)}
              </Button>
            </div>
          </Step>
        </div>

        <aside className="space-y-4">
          <div className="card-surface space-y-3 rounded-xl p-5 text-sm">
            <h2 className="font-semibold">Payment</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tickets</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking fee</span>
              <span>{formatMoney(BOOKING_FEE)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total amount</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <PendingBackendNote>
            No money moves here. Payment and order creation need endpoints on your
            API — this flow records the booking in your browser instead.
          </PendingBackendNote>
        </aside>
      </div>
    </PageShell>
  );
}
