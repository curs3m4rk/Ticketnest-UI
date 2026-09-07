import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { venuesApi } from "@/lib/api/endpoints";
import type { VenueResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/venues/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Manage venues — TicketNest admin" },
      {
        name: "description",
        content: "Create venues, edit their address and set up seating.",
      },
      { property: "og:title", content: "Manage venues — TicketNest admin" },
      {
        property: "og:description",
        content: "Create venues, edit their address and set up seating.",
      },
    ],
  }),
  component: AdminVenuesPage,
});

function AdminVenuesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VenueResponse | null>(null);
  const [form, setForm] = useState({ name: "", city: "", address: "" });

  const venues = useQuery({ queryKey: ["venues"], queryFn: venuesApi.list });

  const save = useMutation({
    mutationFn: () =>
      editing ? venuesApi.update(editing.id, form) : venuesApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast.success(editing ? "Venue updated" : "Venue created");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => venuesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast.success("Venue deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", city: "", address: "" });
    setOpen(true);
  }

  function openEdit(venue: VenueResponse) {
    setEditing(venue);
    setForm({ name: venue.name, city: venue.city, address: venue.address });
    setOpen(true);
  }

  const valid =
    form.name.trim().length > 1 &&
    form.city.trim().length > 1 &&
    form.address.trim().length > 4;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Venues</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New venue
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {venues.isPending ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : venues.isError ? (
          <ApiErrorState error={venues.error} onRetry={() => venues.refetch()} />
        ) : venues.data?.length ? (
          venues.data.map((venue) => (
            <div
              key={venue.id}
              className="card-surface flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{venue.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {venue.address}, {venue.city}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(venue.seatTiers ?? []).map((tier) => (
                    <Badge key={tier} variant="secondary" className="text-[10px]">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/admin/venues/$venueId/seats" params={{ venueId: venue.id }}>
                    <LayoutGrid className="size-4" /> Seats
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(venue)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove.mutate(venue.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="card-surface rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
            No venues yet. Create your first one to start scheduling shows.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit venue" : "New venue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Save venue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
