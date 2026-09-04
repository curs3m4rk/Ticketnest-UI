import { getApiBaseUrl } from "./config";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./session";
import type { TokenResponse } from "./types";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  offline: boolean;

  constructor(
    message: string,
    options: { status?: number; details?: unknown; offline?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.details = options.details;
    this.offline = options.offline ?? false;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | string[] | undefined | null>;
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = getApiBaseUrl();
  const url = new URL(
    path.startsWith("/") ? path : `/${path}`,
    base || "http://localhost:8080",
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
      else url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await parseBody(res)) as TokenResponse | null;
    if (!data?.accessToken) return false;
    setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function rawRequest(path: string, options: RequestOptions) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch {
    throw new ApiError(
      "Could not reach the TicketNest API. Check that it is running and that the API address is correct.",
      { offline: true },
    );
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let res = await rawRequest(path, options);

  if (res.status === 401 && options.auth !== false && getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      res = await rawRequest(path, options);
    } else {
      clearSession();
    }
  }

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : typeof data === "string" && data
          ? data
          : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    if (res.status === 401) clearSession();
    throw new ApiError(message, { status: res.status, details: data });
  }

  return data as T;
}
