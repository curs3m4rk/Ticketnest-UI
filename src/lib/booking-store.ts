// The cart is intentionally local; creating and managing bookings uses the API.
import { useSyncExternalStore } from "react";

export interface CartSeat {
  id: string;
  row: string;
  number: string;
  tier: string;
  price: number;
}

export interface CartItem {
  showId: string;
  showTitle: string;
  genre: string;
  startTime: string;
  venueName: string;
  venueCity: string;
  venueId: string;
  currency: string;
  seats: CartSeat[];
}

const CART_KEY = "ticketnest.cart";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getCart(): CartItem | null {
  return read<CartItem | null>(CART_KEY, null);
}

export function setCart(item: CartItem | null) {
  if (typeof window === "undefined") return;
  if (item) window.localStorage.setItem(CART_KEY, JSON.stringify(item));
  else window.localStorage.removeItem(CART_KEY);
  emit();
}

function cartSnapshot() {
  if (typeof window === "undefined") return "null";
  return window.localStorage.getItem(CART_KEY) ?? "null";
}

export function useCart(): CartItem | null {
  const raw = useSyncExternalStore(subscribe, cartSnapshot, () => "null");
  try {
    return JSON.parse(raw) as CartItem | null;
  } catch {
    return null;
  }
}

export function cartSubtotal(item: CartItem | null): number {
  if (!item) return 0;
  return item.seats.reduce((sum, s) => sum + s.price, 0);
}
