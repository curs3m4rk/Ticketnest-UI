import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Ticket, ShieldCheck } from "lucide-react";

import { ApiErrorState } from "@/components/api-error-state";
import { PageShell } from "@/components/page-shell";
import { ShowCard } from "@/components/show-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showsApi } from "@/lib/api/endpoints";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TicketNest — Book concerts, comedy & festivals" },
      {
        name: "description",
        content:
          "Discover live events near you, pick your seats on a real seat map and confirm your booking in seconds with TicketNest.",
      },
      { property: "og:title", content: "TicketNest — Book concerts, comedy & festivals" },
      {
        property: "og:description",
        content:
          "Discover live events near you, pick your seats and confirm your booking in seconds.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const popular = useQuery({
    queryKey: ["shows", { page: 0, size: 8 }],
    queryFn: () => showsApi.list({ page: 0, size: 8 }),
  });

  return (
    <PageShell wide>
      <section className="hero-surface -mt-8 mb-10 overflow-hidden rounded-b-3xl px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6">
          <span className="flex items-center gap-2 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> Live events, booked in seconds
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight md:text-5xl">
            Book Events,
            <br />
            Create Memories
          </h1>
          <p className="max-w-xl text-sm text-hero-foreground/75">
            Concerts, stand-up comedy, festivals and conferences — find what's on near you and
            choose exactly where you sit.
          </p>
          <Button asChild size="lg">
            <Link to="/shows">
              Explore events <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl font-bold">Popular events</h2>
          <Link to="/shows" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {popular.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : popular.isError ? (
          <ApiErrorState error={popular.error} onRetry={() => popular.refetch()} />
        ) : popular.data?.content.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.data.content.slice(0, 8).map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        ) : (
          <div className="card-surface rounded-xl px-6 py-12 text-center">
            <h3 className="font-semibold">No events published yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Once shows are created they appear here automatically.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/admin/shows">Create a show</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: <Ticket className="size-5" />,
            title: "Real seat maps",
            body: "Choose your exact row and seat, with tier pricing shown as you go.",
          },
          {
            icon: <ShieldCheck className="size-5" />,
            title: "Secure sign-in",
            body: "Your session is protected and refreshed automatically while you browse.",
          },
          {
            icon: <Sparkles className="size-5" />,
            title: "Immediate seat hold",
            body: "Get a server booking reference while your selected seats are held.",
          },
        ].map((item) => (
          <div key={item.title} className="card-surface rounded-xl p-5">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              {item.icon}
            </span>
            <h3 className="mt-3 font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
