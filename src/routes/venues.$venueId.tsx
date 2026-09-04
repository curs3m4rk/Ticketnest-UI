import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showsApi, venuesApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime, tierPrice } from "@/lib/format";

export const Route = createFileRoute("/venues/$venueId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Venue details — TicketNest" },
      {
        name: "description",
        content: "Address, seating tiers and upcoming events for this venue.",
      },
      { property: "og:title", content: "Venue details — TicketNest" },
      {
        property: "og:description",
        content: "Address, seating tiers and upcoming events for this venue.",
      },
    ],
  }),
  component: VenueDetailPage,
});

function VenueDetailPage() {
  const { venueId } = Route.useParams();
  const venue = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => venuesApi.get(venueId),
  });
  const seats = useQuery({
    queryKey: ["venue-seats", venueId],
    queryFn: () => venuesApi.seats(venueId),
  });
  const shows = useQuery({
    queryKey: ["shows", { venue: venueId }],
    queryFn: () => showsApi.list({ page: 0, size: 50 }),
  });

  const venueShows = (shows.data?.content ?? []).filter(
    (s) => s.venue?.id === venueId,
  );

  if (venue.isPending) {
    return (
      <PageShell>
        <Skeleton className="h-48 rounded-xl" />
      </PageShell>
    );
  }

  if (venue.isError || !venue.data) {
    return (
      <PageShell>
        <ApiErrorState error={venue.error} onRetry={() => venue.refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Venues", to: "/venues" },
        { label: venue.data.name },
      ]}
    >
      <div className="card-surface rounded-xl p-6">
        <h1 className="font-display text-2xl font-bold">{venue.data.name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {venue.data.address}, {venue.data.city}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(venue.data.seatTiers ?? []).map((tier) => (
            <Badge key={tier} variant="secondary">
              {tier} · {formatMoney(tierPrice(tier))}
            </Badge>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {seats.data?.length ?? 0} seats mapped
        </p>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold">Upcoming here</h2>
      <div className="mt-3 space-y-3">
        {venueShows.length ? (
          venueShows.map((show) => (
            <div
              key={show.id}
              className="card-surface flex items-center justify-between gap-4 rounded-xl p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{show.title}</p>
                <p className="text-xs text-muted-foreground">
                  {show.genre} · {formatDate(show.startTime)} ·{" "}
                  {formatTime(show.startTime)}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/shows/$showId" params={{ showId: show.id }}>
                  View
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No events scheduled at this venue yet.
          </p>
        )}
      </div>
    </PageShell>
  );
}
