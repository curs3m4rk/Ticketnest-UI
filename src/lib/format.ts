export function formatMoney(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "Date to be announced";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

/** Indicative tier pricing — the API does not expose ticket prices yet. */
const TIER_PRICES: Record<string, number> = {
  SILVER: 1499,
  GOLD: 2499,
  PLATINUM: 3499,
  VIP: 3999,
  DIAMOND: 4999,
  BALCONY: 999,
  REGULAR: 799,
  STANDARD: 899,
  PREMIUM: 1999,
  RECLINER: 2999,
};

export function tierPrice(tier: string): number {
  const key = tier?.toUpperCase?.() ?? "";
  if (TIER_PRICES[key]) return TIER_PRICES[key];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;
  return 499 + (hash % 30) * 100;
}

const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.45 0.2 300), oklch(0.32 0.14 285))",
  "linear-gradient(135deg, oklch(0.5 0.18 330), oklch(0.3 0.13 300))",
  "linear-gradient(135deg, oklch(0.48 0.16 265), oklch(0.28 0.12 290))",
  "linear-gradient(135deg, oklch(0.52 0.17 25), oklch(0.3 0.13 320))",
  "linear-gradient(135deg, oklch(0.5 0.15 195), oklch(0.28 0.12 275))",
];

export function posterGradient(seed: string): string {
  let hash = 0;
  for (const ch of seed ?? "") hash = (hash * 33 + ch.charCodeAt(0)) % 99991;
  return GRADIENTS[hash % GRADIENTS.length] ?? GRADIENTS[0]!;
}

export function initials(first?: string, last?: string, email?: string): string {
  const a = first?.trim()?.[0] ?? email?.trim()?.[0] ?? "T";
  const b = last?.trim()?.[0] ?? "";
  return `${a}${b}`.toUpperCase();
}
