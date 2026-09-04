const STORAGE_KEY = "ticketnest.apiBaseUrl";

const ENV_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

export const DEFAULT_API_BASE_URL = ENV_BASE_URL || "http://localhost:8080";

const listeners = new Set<() => void>();

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE_URL;
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string) {
  const clean = url.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined") {
    if (clean) window.localStorage.setItem(STORAGE_KEY, clean);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((l) => l());
}

export function subscribeApiBaseUrl(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
