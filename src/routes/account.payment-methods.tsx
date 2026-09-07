import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";

import { PendingBackendNote } from "@/components/pending-backend-note";

export const Route = createFileRoute("/account/payment-methods")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Payment methods — TicketNest" },
      {
        name: "description",
        content: "The payment methods TicketNest checkout will offer.",
      },
      { property: "og:title", content: "Payment methods — TicketNest" },
      {
        property: "og:description",
        content: "The payment methods checkout will offer.",
      },
    ],
  }),
  component: PaymentMethodsPage,
});

const METHODS = [
  { label: "UPI", hint: "Pay using any UPI app", icon: Smartphone },
  { label: "Credit / Debit card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { label: "Net banking", hint: "All major banks", icon: Landmark },
  { label: "Wallets", hint: "Paytm, PhonePe, Amazon Pay", icon: Wallet },
];

function PaymentMethodsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Payment methods</h1>
      <div className="mt-4 space-y-3">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="card-surface flex items-center gap-3 rounded-xl p-4"
            >
              <Icon className="size-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <PendingBackendNote>
          Nothing is saved here yet — a payment provider and matching API endpoints
          are needed before cards or UPI IDs can be stored.
        </PendingBackendNote>
      </div>
    </div>
  );
}
