import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { venuesApi } from "@/lib/api/endpoints";

export const Route = createFileRoute("/venues/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Venues — TicketNest" },
      {
        name: "description",
        content: "Every venue on TicketNest with its city, address and seating tiers.",
      },
      { property: "og:title", content: "Venues — TicketNest" },
      {
        property: "og:description",
        content: "Every venue with its city, address and seating tiers.",
      },
    ],
  }),
  component: VenuesPage,
});

function VenuesPage() {
  const venues = useQuery({ queryKey: ["venues"], queryFn: venuesApi.list });

  return (
    <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Venues" }]}>
      <h1 className="font-display text-2xl font-bold">Venues</h1>

      <div className="mt-6">
        {venues.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : venues.isError ? (
          <ApiErrorState error={venues.error} onRetry={() => venues.refetch()} />
        ) : venues.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues.data.map((venue) => (
              <Link
                key={venue.id}
                to="/venues/$venueId"
                params={{ venueId: venue.id }}
                className="card-surface rounded-xl p-5 transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <h2 className="font-semibold">{venue.name}</h2>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {venue.address}, {venue.city}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(venue.seatTiers ?? []).map((tier) => (
                    <Badge key={tier} variant="secondary" className="text-[10px]">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface rounded-xl px-6 py-12 text-center">
            <h2 className="font-semibold">No venues yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first venue from the admin console.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
