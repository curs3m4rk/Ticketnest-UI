import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";

export interface ConsoleNavItem {
  to: LinkProps["to"];
  label: string;
  icon: ReactNode;
}

export function ConsoleShell({
  title,
  items,
  children,
}: {
  title: string;
  items: ConsoleNavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="md:w-56 md:shrink-0">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {items.map((item) => (
              <Link
                key={String(item.to)}
                to={item.to}
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
