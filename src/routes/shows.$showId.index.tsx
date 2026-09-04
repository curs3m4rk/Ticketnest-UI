import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Headphones, MapPin, ShieldCheck, Zap } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { ShowPoster } from "@/components/show-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showsApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime, tierPrice } from "@/lib/format";

export const Route = createFileRoute("/shows/$showId/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Event details — TicketNest" },
      {
        name: "description",
        content:
          "See timing, venue and ticket tiers for this live event, then choose your seats.",
      },
      { property: "og:title", content: "Event details — TicketNest" },
      {
        property: "og:description",
        content: "Timing, venue and ticket tiers for this live event.",
      },
    ],
  }),
  component: ShowDetailPage,
});

function ShowDetailPage() {
  const { showId } = Route.useParams();
  const show = useQuery({
    queryKey: ["show", showId],
    queryFn: () => showsApi.get(showId),
  });

  if (show.isPending) {
    return (
      <PageShell>
        <Skeleton className="h-64 rounded-xl" />
      </PageShell>
    );
  }

  if (show.isError || !show.data) {
    return (
      <PageShell>
        <ApiErrorState error={show.error} onRetry={() => show.refetch()} />
      </PageShell>
    );
  }

  const data = show.data;
  const tiers = data.venue?.seatTiers ?? [];

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/" },
        { label: "Events", to: "/shows" },
        { label: data.title },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="card-surface flex flex-col gap-5 rounded-xl p-5 sm:flex-row">
            <ShowPoster
              seed={data.id + data.title}
              title={data.genre}
              className="h-40 w-full shrink-0 overflow-hidden rounded-lg sm:w-32"
            />
            <div className="space-y-3">
              <div>
                <h1 className="font-display text-2xl font-bold">{data.title}</h1>
                <p className="text-sm text-primary">{data.genre}</p>
              </div>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {formatDate(data.startTime)} · {formatTime(data.startTime)}
              </p>
              {data.venue ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {data.venue.name}, {data.venue.address}, {data.venue.city}
                </p>
              ) : null}
              <Badge variant="secondary" className="uppercase">
                {data.status}
              </Badge>
            </div>
          </div>

          <div className="card-surface rounded-xl p-5">
            <h2 className="font-semibold">Ticket tiers</h2>
            {tiers.length ? (
              <ul className="mt-3 divide-y">
                {tiers.map((tier) => (
                  <li
                    key={tier}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium">{tier}</span>
                    <span className="font-semibold text-primary">
                      {formatMoney(tierPrice(tier))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No seat tiers have been set up for this venue yet.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Prices are indicative per tier — your API does not publish ticket
              prices yet.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card-surface space-y-4 rounded-xl p-5">
            <h2 className="font-semibold">Order summary</h2>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>0 tickets</span>
              <span>{formatMoney(0)}</span>
            </div>
            {data.venue ? (
              <Button asChild className="w-full">
                <Link to="/shows/$showId/seats" params={{ showId: data.id }}>
                  Select seats
                </Link>
              </Button>
            ) : (
              <Button className="w-full" disabled>
                Venue not assigned
              </Button>
            )}
          </div>
          <div className="card-surface space-y-4 rounded-xl p-5 text-sm">
            {[
              {
                icon: <ShieldCheck className="size-4" />,
                title: "Secure booking",
                body: "Your session stays protected end to end.",
              },
              {
                icon: <Zap className="size-4" />,
                title: "Instant confirmation",
                body: "Booking reference issued immediately.",
              },
              {
                icon: <Headphones className="size-4" />,
                title: "24/7 support",
                body: "We're here whenever you need help.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 text-primary">{item.icon}</span>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
