// Local-only cart & bookings. The API has no order/booking endpoints yet, so
// everything here lives in the browser and is clearly labelled in the UI.
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
  seats: CartSeat[];
}

export interface Booking extends CartItem {
  reference: string;
  bookedAt: string;
  total: number;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  contact: { fullName: string; email: string; phone: string };
  paymentMethod: string;
}

const CART_KEY = "ticketnest.cart";
const BOOKINGS_KEY = "ticketnest.bookings";
export const BOOKING_FEE = 149;

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

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
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

export function getBookings(): Booking[] {
  return read<Booking[]>(BOOKINGS_KEY, []);
}

export function confirmBooking(
  item: CartItem,
  contact: Booking["contact"],
  paymentMethod: string,
): Booking {
  const total =
    item.seats.reduce((sum, s) => sum + s.price, 0) + (item.seats.length ? BOOKING_FEE : 0);
  const reference = `TN${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const booking: Booking = {
    ...item,
    reference,
    bookedAt: new Date().toISOString(),
    total,
    status: "UPCOMING",
    contact,
    paymentMethod,
  };
  write(BOOKINGS_KEY, [booking, ...getBookings()]);
  setCart(null);
  return booking;
}

export function cancelBooking(reference: string) {
  write(
    BOOKINGS_KEY,
    getBookings().map((b) =>
      b.reference === reference ? { ...b, status: "CANCELLED" as const } : b,
    ),
  );
}

function cartSnapshot() {
  if (typeof window === "undefined") return "null";
  return window.localStorage.getItem(CART_KEY) ?? "null";
}

function bookingsSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(BOOKINGS_KEY) ?? "[]";
}

export function useCart(): CartItem | null {
  const raw = useSyncExternalStore(subscribe, cartSnapshot, () => "null");
  try {
    return JSON.parse(raw) as CartItem | null;
  } catch {
    return null;
  }
}

export function useBookings(): Booking[] {
  const raw = useSyncExternalStore(subscribe, bookingsSnapshot, () => "[]");
  try {
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

export function cartSubtotal(item: CartItem | null): number {
  if (!item) return 0;
  return item.seats.reduce((sum, s) => sum + s.price, 0);
}
