import { useSyncExternalStore } from "react";
import { getSessionUser, subscribeSession } from "./api/session";
import type { SessionUser } from "./api/types";

function snapshot(): string {
  if (typeof window === "undefined") return "null";
  return window.localStorage.getItem("ticketnest.user") ?? "null";
}

export function useSession(): { user: SessionUser | null; hydrated: boolean } {
  const raw = useSyncExternalStore(
    subscribeSession,
    snapshot,
    () => "server" as const,
  );
  if (raw === "server") return { user: null, hydrated: false };
  return { user: getSessionUser(), hydrated: true };
}

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "ROLE_ADMIN", "MANAGER", "ORGANIZER"];

export function canManage(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.roles.some((r) => ADMIN_ROLES.includes(r.name.toUpperCase()));
}
