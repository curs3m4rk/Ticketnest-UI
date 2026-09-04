import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 font-display font-semibold text-foreground">
          <span className="gradient-primary flex size-7 items-center justify-center rounded-lg">
            <Ticket className="size-3.5 text-primary-foreground" />
          </span>
          TicketNest
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link to="/shows" className="hover:text-foreground">
            Events
          </Link>
          <Link to="/venues" className="hover:text-foreground">
            Venues
          </Link>
          <Link to="/account/bookings" className="hover:text-foreground">
            My bookings
          </Link>
        </nav>
        <p>Live events, booked in seconds.</p>
      </div>
    </footer>
  );
}
