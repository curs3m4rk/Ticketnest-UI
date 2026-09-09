import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, Search, Star } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { ShowPoster, startingPrice } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { showsApi, venuesApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime } from "@/lib/format";

interface ShowsSearch {
  q?: string;
  city?: string;
  genre?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
}

const ANY = "__any";

export const Route = createFileRoute("/shows/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): ShowsSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    city: typeof search["city"] === "string" ? search["city"] : "",
    genre: typeof search["genre"] === "string" ? search["genre"] : "",
    from: typeof search["from"] === "string" ? search["from"] : "",
    to: typeof search["to"] === "string" ? search["to"] : "",
    sort: typeof search["sort"] === "string" ? search["sort"] : "startTime,asc",
    page: Number(search["page"]) > 0 ? Number(search["page"]) : 0,
  }),
  head: () => ({
    meta: [
      { title: "All events — TicketNest" },
      {
        name: "description",
        content:
          "Browse every live event on TicketNest. Filter by city, genre and date, then pick your seats.",
      },
      { property: "og:title", content: "All events — TicketNest" },
      {
        property: "og:description",
        content: "Filter live events by city, genre and date, then pick your seats.",
      },
    ],
  }),
  component: ShowsPage,
});

function ShowsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const update = (patch: Partial<ShowsSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, page: 0, ...patch }),
    });

  const venues = useQuery({ queryKey: ["venues"], queryFn: venuesApi.list });

  const shows = useQuery({
    queryKey: ["shows", search],
    queryFn: () =>
      showsApi.list({
        city: search.city || undefined,
        genre: search.genre || undefined,
        from: search.from ? new Date(search.from).toISOString() : undefined,
        to: search.to ? new Date(`${search.to}T23:59:59`).toISOString() : undefined,
        page: search.page,
        size: 10,
        sort: search.sort,
      }),
  });

  const cities = [...new Set((venues.data ?? []).map((v) => v.city))].sort();
  const query = search.q.trim().toLowerCase();
  const results = (shows.data?.content ?? []).filter((show) =>
    query
      ? [show.title, show.genre, show.venue?.name, show.venue?.city]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(query))
      : true,
  );

  return (
    <PageShell crumbs={[{ label: "Home", to: "/" }, { label: "Events" }]}>
      <h1 className="font-display text-2xl font-bold">Events</h1>

      <div className="card-surface mt-4 space-y-4 rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search events, venues, cities…"
            className="pl-9"
            aria-label="Search events"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Select
              value={search.city || ANY}
              onValueChange={(v) => update({ city: v === ANY ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All locations</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="genre" className="text-xs text-muted-foreground">
              Category
            </Label>
            <Input
              id="genre"
              value={search.genre}
              placeholder="All categories"
              onChange={(e) => update({ genre: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="from"
              type="date"
              value={search.from}
              onChange={(e) => update({ from: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="to"
              type="date"
              value={search.to}
              onChange={(e) => update({ to: e.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Select value={search.sort} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startTime,asc">Date: soonest first</SelectItem>
              <SelectItem value="startTime,desc">Date: latest first</SelectItem>
              <SelectItem value="title,asc">Title: A to Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                search: {
                  q: "",
                  city: "",
                  genre: "",
                  from: "",
                  to: "",
                  sort: "startTime,asc",
                  page: 0,
                },
              })
            }
          >
            Clear filters
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {shows.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : shows.isError ? (
          <ApiErrorState error={shows.error} onRetry={() => shows.refetch()} />
        ) : results.length ? (
          results.map((show) => {
            const price = startingPrice(show);
            return (
              <article
                key={show.id}
                className="card-surface flex flex-col gap-4 rounded-xl p-3 sm:flex-row sm:items-center"
              >
                <ShowPoster
                  seed={show.id + show.title}
                  title={show.genre}
                  className="h-24 w-full shrink-0 overflow-hidden rounded-lg sm:w-28"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{show.title}</h2>
                  <p className="text-xs font-medium text-primary">{show.genre}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {formatDate(show.startTime)} · {formatTime(show.startTime)}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span className="truncate">
                      {show.venue?.name}
                      {show.venue?.city ? `, ${show.venue.city}` : ""}
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-warning text-warning" />
                    {show.status}
                  </span>
                  <span className="font-semibold text-primary">
                    {price ? formatMoney(price) : "—"}
                  </span>
                  <Button asChild size="sm">
                    <Link to="/shows/$showId" params={{ showId: show.id }}>
                      View details
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="card-surface rounded-xl px-6 py-12 text-center">
            <h3 className="font-semibold">No events match those filters</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening the date range or clearing the search.
            </p>
          </div>
        )}
      </div>

      {shows.data && shows.data.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={shows.data.first}
            onClick={() =>
              navigate({ search: (prev) => ({ ...prev, page: prev.page - 1 }) })
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {shows.data.pageNumber + 1} of {shows.data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={shows.data.last}
            onClick={() =>
              navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
            }
          >
            Next
          </Button>
        </div>
      ) : null}
    </PageShell>
  );
}
