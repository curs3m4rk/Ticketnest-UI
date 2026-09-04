import type { LoginResponse, SessionUser } from "./types";

const TOKEN_KEY = "ticketnest.accessToken";
const REFRESH_KEY = "ticketnest.refreshToken";
const USER_KEY = "ticketnest.user";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
  emit();
}

export function saveLogin(login: LoginResponse) {
  if (typeof window === "undefined") return;
  const user: SessionUser = {
    id: login.id,
    email: login.email,
    firstName: login.firstName,
    lastName: login.lastName,
    phoneNumber: login.phoneNumber,
    roles: login.roles ?? [],
  };
  window.localStorage.setItem(TOKEN_KEY, login.token);
  window.localStorage.setItem(REFRESH_KEY, login.refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  emit();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
  emit();
}
