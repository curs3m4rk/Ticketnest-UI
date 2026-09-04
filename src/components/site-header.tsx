import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Ticket, User, LayoutDashboard, LogOut } from "lucide-react";

import { ApiSettingsDialog } from "@/components/api-settings-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/endpoints";
import { clearSession, getRefreshToken } from "@/lib/api/session";
import { useCart } from "@/lib/booking-store";
import { initials } from "@/lib/format";
import { canManage, useSession } from "@/lib/use-session";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shows", label: "Events" },
  { to: "/venues", label: "Venues" },
] as const;

export function SiteHeader() {
  const { user } = useSession();
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const seatCount = cart?.seats.length ?? 0;

  async function signOut() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore — the local session is cleared regardless
      }
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    clearSession();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 hero-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="gradient-primary flex size-8 items-center justify-center rounded-lg">
            <Ticket className="size-4 text-primary-foreground" />
          </span>
          TicketNest
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-hero-foreground/75 transition-colors hover:text-hero-foreground"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-hero-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-hero-foreground/80">
            <ApiSettingsDialog />
          </span>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart" aria-label="Your cart">
              <ShoppingCart className="size-5" />
              {seatCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {seatCount}
                </span>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Your account">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials(user.firstName, user.lastName, user.email)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account/bookings">
                    <Ticket className="size-4" /> My bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">
                    <User className="size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                {canManage(user) ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/shows">
                      <LayoutDashboard className="size-4" /> Admin console
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-1">
              <Link to="/auth/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
