import { Info } from "lucide-react";

export function PendingBackendNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-dashed bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
