import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleDollarSign, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showsApi, venuesApi } from "@/lib/api/endpoints";
import { formatDate, formatTime } from "@/lib/format";
import type { ShowResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/shows")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Manage shows — TicketNest admin" },
      {
        name: "description",
        content: "Create, edit and remove live events on TicketNest.",
      },
      { property: "og:title", content: "Manage shows — TicketNest admin" },
      { property: "og:description", content: "Create, edit and remove live events." },
    ],
  }),
  component: AdminShowsPage,
});

const STATUSES = ["ACTIVE", "SCHEDULED", "ON_SALE", "SOLD_OUT", "CANCELLED", "COMPLETED"];

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminShowsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ShowResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [inventoryShow, setInventoryShow] = useState<ShowResponse | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [tierPrices, setTierPrices] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    venueId: "",
    title: "",
    genre: "",
    startTime: "",
    status: "ACTIVE",
  });

  const venues = useQuery({ queryKey: ["venues"], queryFn: venuesApi.list });
  const shows = useQuery({
    queryKey: ["shows", { admin: true }],
    queryFn: () => showsApi.list({ page: 0, size: 100 }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["shows"] });
    queryClient.invalidateQueries({ queryKey: ["show"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        venueId: form.venueId,
        title: form.title,
        genre: form.genre,
        startTime: new Date(form.startTime).toISOString(),
        status: form.status,
      };
      return editing ? showsApi.update(editing.id, body) : showsApi.create(body);
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Show updated" : "Show created");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => showsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Show deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const initializeInventory = useMutation({
    mutationFn: () =>
      showsApi.initializeInventory(inventoryShow!.id, {
        currency,
        tierPrices: (inventoryShow?.venue?.seatTiers ?? []).map((tier) => ({
          tier,
          price: Number(tierPrices[tier]),
        })),
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["show-seats", result.showId] });
      toast.success(`Inventory created with ${result.seatCount} seats`);
      setInventoryShow(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openInventory(show: ShowResponse) {
    setInventoryShow(show);
    setCurrency("INR");
    setTierPrices(Object.fromEntries((show.venue?.seatTiers ?? []).map((tier) => [tier, ""])));
  }

  function openCreate() {
    setEditing(null);
    setForm({
      venueId: venues.data?.[0]?.id ?? "",
      title: "",
      genre: "",
      startTime: "",
      status: "ACTIVE",
    });
    setOpen(true);
  }

  function openEdit(show: ShowResponse) {
    setEditing(show);
    setForm({
      venueId: show.venue?.id ?? "",
      title: show.title,
      genre: show.genre,
      startTime: toLocalInput(show.startTime),
      status: show.status,
    });
    setOpen(true);
  }

  const valid =
    form.venueId && form.title.trim().length > 1 && form.genre.trim().length > 1 && form.startTime;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Shows</h1>
        <Button onClick={openCreate} disabled={!venues.data?.length}>
          <Plus className="size-4" /> New show
        </Button>
      </div>

      <div className="card-surface mt-4 overflow-hidden rounded-xl">
        {shows.isPending ? (
          <Skeleton className="h-64" />
        ) : shows.isError ? (
          <div className="p-4">
            <ApiErrorState error={shows.error} onRetry={() => shows.refetch()} />
          </div>
        ) : shows.data?.content.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.data.content.map((show) => (
                <TableRow key={show.id}>
                  <TableCell className="font-medium">{show.title}</TableCell>
                  <TableCell>{show.genre}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(show.startTime)} · {formatTime(show.startTime)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{show.venue?.name ?? "—"}</TableCell>
                  <TableCell>{show.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Initialize priced seat inventory"
                      onClick={() => openInventory(show)}
                    >
                      <CircleDollarSign className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(show)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(show.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No shows yet. {venues.data?.length ? "" : "Add a venue first."}
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit show" : "New show"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Venue</Label>
              <Select
                value={form.venueId}
                onValueChange={(v) => setForm((f) => ({ ...f, venueId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a venue" />
                </SelectTrigger>
                <SelectContent>
                  {(venues.data ?? []).map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} — {venue.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Save show"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(inventoryShow)}
        onOpenChange={(value) => !value && setInventoryShow(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize inventory — {inventoryShow?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Set the price for every tier. Inventory can only be initialized once per show.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                maxLength={3}
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              />
            </div>
            {(inventoryShow?.venue?.seatTiers ?? []).map((tier) => (
              <div key={tier} className="space-y-1.5">
                <Label htmlFor={`tier-${tier}`}>{tier} price</Label>
                <Input
                  id={`tier-${tier}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={tierPrices[tier] ?? ""}
                  onChange={(event) =>
                    setTierPrices((prices) => ({ ...prices, [tier]: event.target.value }))
                  }
                />
              </div>
            ))}
            {inventoryShow && !inventoryShow.venue?.seatTiers?.length ? (
              <p className="text-sm text-destructive">
                Create venue seats before initializing inventory.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInventoryShow(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                initializeInventory.isPending ||
                currency.length !== 3 ||
                !inventoryShow?.venue?.seatTiers?.length ||
                (inventoryShow?.venue?.seatTiers ?? []).some(
                  (tier) => Number(tierPrices[tier]) <= 0,
                )
              }
              onClick={() => initializeInventory.mutate()}
            >
              {initializeInventory.isPending ? "Initializing…" : "Initialize inventory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
