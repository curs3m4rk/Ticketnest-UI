import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney, posterGradient, tierPrice } from "@/lib/format";
import type { ShowResponse } from "@/lib/api/types";

export function startingPrice(show: ShowResponse): number | null {
  const tiers = show.venue?.seatTiers ?? [];
  if (!tiers.length) return null;
  return Math.min(...tiers.map(tierPrice));
}

export function ShowPoster({
  seed,
  title,
  className,
}: {
  seed: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={className ?? "aspect-[4/3] w-full"}
      style={{ backgroundImage: posterGradient(seed) }}
      role="img"
      aria-label={`Artwork for ${title}`}
    >
      <div className="flex h-full items-end p-3">
        <span className="font-display text-sm font-semibold text-hero-foreground/90 drop-shadow">
          {title}
        </span>
      </div>
    </div>
  );
}

export function ShowCard({ show }: { show: ShowResponse }) {
  const price = startingPrice(show);
  return (
    <Link
      to="/shows/$showId"
      params={{ showId: show.id }}
      className="card-surface group flex flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <ShowPoster
        seed={show.id + show.title}
        title={show.genre}
        className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold">{show.title}</h3>
        <p className="text-xs text-muted-foreground">{show.genre}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" /> {formatDate(show.startTime)}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="line-clamp-1">
            {show.venue?.name}
            {show.venue?.city ? `, ${show.venue.city}` : ""}
          </span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-primary">
            {price ? `${formatMoney(price)} onwards` : "Seats coming soon"}
          </span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {show.status}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
