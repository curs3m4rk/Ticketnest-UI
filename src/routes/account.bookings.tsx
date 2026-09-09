import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
import { ShowPoster } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bookingsApi, showsApi } from "@/lib/api/endpoints";
import { formatDate, formatMoney, formatTime } from "@/lib/format";
import type { BookingResponse } from "@/lib/api/types";

export const Route = createFileRoute("/account/bookings")({
  ssr: false,
  head: () => ({ meta: [{ title: "My bookings — TicketNest" }] }),
  component: BookingsPage,
});

function BookingRow({ booking }: { booking: BookingResponse }) {
  const queryClient = useQueryClient();
  const show = useQuery({
    queryKey: ["show", booking.showId],
    queryFn: () => showsApi.get(booking.showId),
  });
  const cancel = useMutation({
    mutationFn: () => bookingsApi.cancel(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
      queryClient.invalidateQueries({ queryKey: ["show-seats", booking.showId] });
      toast.success("Seat hold released");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <article className="card-surface flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
      <ShowPoster
        seed={booking.showId + (show.data?.title ?? "event")}
        title={show.data?.genre ?? "Event"}
        className="h-20 w-full shrink-0 overflow-hidden rounded-lg sm:w-24"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold">{show.data?.title ?? "Event"}</h2>
        <p className="text-xs text-muted-foreground">
          {formatDate(show.data?.startTime)} · {formatTime(show.data?.startTime)}
        </p>
        <p className="text-xs text-muted-foreground">Status: {booking.status}</p>
        <p className="mt-1 text-xs">
          {booking.seats.map((seat) => `${seat.tier} · ${seat.row}${seat.number}`).join(" | ")}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="max-w-48 break-all text-xs text-muted-foreground">
          Booking ID
          <br />
          <span className="font-medium text-foreground">{booking.id}</span>
        </p>
        <p className="text-sm font-semibold">
          {formatMoney(booking.totalAmount, booking.currency)}
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/account/tickets/$reference" params={{ reference: booking.id }}>
              View details
            </Link>
          </Button>
          {booking.status === "HELD" ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate()}
            >
              Release
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BookingsPage() {
  const bookings = useQuery({
    queryKey: ["bookings"],
    queryFn: () => bookingsApi.list(undefined, 0, 100),
  });

  if (bookings.isPending) return <Skeleton className="h-72 rounded-xl" />;
  if (bookings.isError)
    return <ApiErrorState error={bookings.error} onRetry={() => bookings.refetch()} />;

  const active = bookings.data.content.filter((booking) => booking.status === "HELD");
  const history = bookings.data.content.filter((booking) => booking.status !== "HELD");
  const groups: Array<[string, string, BookingResponse[]]> = [
    ["active", "Active holds", active],
    ["history", "History", history],
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My bookings</h1>
      <Tabs defaultValue="active" className="mt-4">
        <TabsList>
          {groups.map(([value, label, list]) => (
            <TabsTrigger key={value} value={value}>
              {label} ({list.length})
            </TabsTrigger>
          ))}
        </TabsList>
        {groups.map(([value, label, list]) => (
          <TabsContent key={value} value={value} className="space-y-3">
            {list.length ? (
              list.map((booking) => <BookingRow key={booking.id} booking={booking} />)
            ) : (
              <div className="card-surface rounded-xl px-6 py-12 text-center">
                <h2 className="font-semibold">No {label.toLowerCase()}</h2>
                <Button asChild className="mt-4">
                  <Link to="/shows">Browse events</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
