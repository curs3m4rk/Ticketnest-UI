import type { ReactNode } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export interface Crumb {
  label: string;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}

export function PageShell({
  children,
  crumbs,
  wide,
}: {
  children: ReactNode;
  crumbs?: Crumb[];
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {crumbs?.length ? (
          <div className="border-b bg-card">
            <nav
              aria-label="Breadcrumb"
              className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-3 text-xs text-muted-foreground"
            >
              {crumbs.map((crumb, i) => (
                <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-3" /> : null}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      params={crumb.params}
                      className="hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        ) : null}
        <div
          className={
            wide ? "mx-auto max-w-7xl px-4 py-8" : "mx-auto max-w-6xl px-4 py-8"
          }
        >
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
