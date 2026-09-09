import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { ShowSeatResponse } from "@/lib/api/types";

export interface SeatRow {
  row: string;
  seats: ShowSeatResponse[];
}

export function groupSeats(seats: ShowSeatResponse[]): SeatRow[] {
  const map = new Map<string, ShowSeatResponse[]>();
  for (const seat of seats) {
    const key = seat.row ?? "-";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(seat);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) =>
        String(a.number).localeCompare(String(b.number), undefined, { numeric: true }),
      ),
    }));
}

export function SeatMap({
  seats,
  selectedIds,
  onToggle,
  maxSeats = 10,
}: {
  seats: ShowSeatResponse[];
  selectedIds: string[];
  onToggle: (seat: ShowSeatResponse) => void;
  maxSeats?: number;
}) {
  const rows = useMemo(() => groupSeats(seats), [seats]);
  const tiers = useMemo(() => [...new Set(seats.map((s) => s.tier))].sort(), [seats]);
  const selected = new Set(selectedIds);
  const limitReached = selectedIds.length >= maxSeats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-seat-available" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-seat-reserved" /> Unavailable
        </span>
      </div>

      <div className="mx-auto w-full max-w-md rounded-b-[50%] border-x border-b bg-muted px-6 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Stage
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max space-y-1.5 py-2">
          {rows.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">{row}</span>
              <div className="flex gap-1.5">
                {rowSeats.map((seat) => {
                  const isSelected = selected.has(seat.id);
                  const unavailable = seat.availability !== "AVAILABLE";
                  const disabled = unavailable || (!isSelected && limitReached);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onToggle(seat)}
                      title={`${seat.row}${seat.number} · ${seat.tier} · ${formatMoney(seat.price, seat.currency)}${unavailable ? " · Unavailable" : ""}`}
                      aria-pressed={isSelected}
                      className={cn(
                        "size-7 rounded text-[10px] font-medium transition-colors",
                        unavailable
                          ? "bg-seat-reserved text-muted-foreground"
                          : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-seat-available text-seat-available-foreground hover:bg-primary/25",
                        disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {tiers.length ? (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-xs text-muted-foreground">
          {tiers.map((tier) => {
            const seat = seats.find((item) => item.tier === tier);
            return (
              <span key={tier}>
                <span className="font-medium text-foreground">{tier}</span> ·{" "}
                {formatMoney(seat?.price ?? 0, seat?.currency)}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
