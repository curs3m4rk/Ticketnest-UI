import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { venuesApi } from "@/lib/api/endpoints";
import type { SeatRangeRequest } from "@/lib/api/types";

export const Route = createFileRoute("/admin/venues/$venueId/seats")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Venue seating — TicketNest admin" },
      {
        name: "description",
        content: "Add rows of seats by tier and review a venue's seating layout.",
      },
      { property: "og:title", content: "Venue seating — TicketNest admin" },
      {
        property: "og:description",
        content: "Add rows of seats by tier and review the seating layout.",
      },
    ],
  }),
  component: AdminSeatsPage,
});

const emptyRange = (): SeatRangeRequest => ({
  row: "",
  startNumber: 1,
  endNumber: 10,
  tier: "REGULAR",
});

function AdminSeatsPage() {
  const { venueId } = Route.useParams();
  const queryClient = useQueryClient();
  const [ranges, setRanges] = useState<SeatRangeRequest[]>([emptyRange()]);

  const venue = useQuery({
    queryKey: ["venue", venueId],
    queryFn: () => venuesApi.get(venueId),
  });
  const seats = useQuery({
    queryKey: ["venue-seats", venueId],
    queryFn: () => venuesApi.seats(venueId),
  });

  const create = useMutation({
    mutationFn: () => venuesApi.createSeats(venueId, { ranges }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["venue-seats", venueId] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", venueId] });
      toast.success(`${result.createdCount} seats added`);
      setRanges([emptyRange()]);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = (index: number, patch: Partial<SeatRangeRequest>) =>
    setRanges((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const valid = ranges.every(
    (r) =>
      r.row.trim().length > 0 &&
      r.tier.trim().length > 0 &&
      r.startNumber >= 1 &&
      r.endNumber >= r.startNumber,
  );

  const byTier = (seats.data ?? []).reduce<Record<string, number>>((acc, seat) => {
    acc[seat.tier] = (acc[seat.tier] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
        <Link to="/admin/venues">
          <ArrowLeft className="size-4" /> All venues
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-bold">
        Seating {venue.data ? `· ${venue.data.name}` : ""}
      </h1>
      <p className="text-sm text-muted-foreground">
        {seats.data ? `${seats.data.length} seats configured` : "Loading seats…"}
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section className="card-surface rounded-xl p-5">
          <h2 className="font-semibold">Add seat rows</h2>
          <div className="mt-3 space-y-4">
            {ranges.map((range, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Row</Label>
                    <Input
                      value={range.row}
                      placeholder="A"
                      onChange={(e) => update(index, { row: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tier</Label>
                    <Input
                      value={range.tier}
                      placeholder="REGULAR"
                      onChange={(e) => update(index, { tier: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>From seat</Label>
                    <Input
                      type="number"
                      min={1}
                      value={range.startNumber}
                      onChange={(e) =>
                        update(index, { startNumber: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>To seat</Label>
                    <Input
                      type="number"
                      min={1}
                      value={range.endNumber}
                      onChange={(e) => update(index, { endNumber: Number(e.target.value) })}
                    />
                  </div>
                </div>
                {ranges.length > 1 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      setRanges((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="size-4" /> Remove row
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setRanges((prev) => [...prev, emptyRange()])}
            >
              <Plus className="size-4" /> Another row
            </Button>
            <Button disabled={!valid || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? "Adding…" : "Add seats"}
            </Button>
          </div>
        </section>

        <section className="card-surface rounded-xl p-5">
          <h2 className="font-semibold">Current seating</h2>
          {seats.isPending ? (
            <Skeleton className="mt-3 h-40 rounded-lg" />
          ) : seats.isError ? (
            <div className="mt-3">
              <ApiErrorState error={seats.error} onRetry={() => seats.refetch()} />
            </div>
          ) : seats.data?.length ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(byTier).map(([tier, count]) => (
                  <Badge key={tier} variant="secondary">
                    {tier} · {count}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                {Object.entries(
                  seats.data.reduce<Record<string, string[]>>((acc, seat) => {
                    (acc[seat.row] ??= []).push(seat.number);
                    return acc;
                  }, {}),
                ).map(([row, numbers]) => (
                  <div key={row} className="text-sm">
                    <span className="font-medium">Row {row}</span>
                    <span className="ml-2 text-muted-foreground">
                      {numbers.length} seats ({numbers.join(", ")})
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No seats yet — add your first rows on the left.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
