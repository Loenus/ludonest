import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Coins, MapPin, Sparkles, Users } from "lucide-react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Badge } from "@/components/ui/badge";
import { getSession, resolveHomePath } from "@/lib/auth";
import { eventKindLabel, formatEuro } from "@/lib/event-kind";
import { getEventViewerState, getPublicEvent } from "@/lib/events";
import { dayKey, formatEventDate, hasStarted, timeLabel } from "@/lib/format";
import { isSafeRelativePath } from "@/lib/utils";
import { VenueAvatar } from "@/lib/venue-avatar";

import { EventActions } from "./_components/event-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) return { title: "Evento · LudoNest" };
  return {
    title: `${event.title} · LudoNest`,
    description: event.description.slice(0, 160) || undefined,
  };
}

export default async function EventDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const [session, event] = await Promise.all([getSession(), getPublicEvent(id)]);
  if (!event) notFound();

  const homeHref = session ? await resolveHomePath(session) : null;
  const { joined, canManage } = await getEventViewerState(event, session);

  const backHref = isSafeRelativePath(from) ? from : "/eventi";
  const backLabel = backHref === "/eventi" ? "Tutti gli eventi" : "Torna alla tua area";

  const isPast = hasStarted(event.startsAt);
  const d = formatEventDate(dayKey(event.startsAt));
  const facts: { icon: typeof CalendarClock; label: string; value: string }[] = [
    { icon: CalendarClock, label: "Quando", value: `${d.day} ${d.month} · ${timeLabel(event.startsAt)}` },
    {
      icon: Coins,
      label: "Consumazione minima",
      value: event.minConsumption != null ? `€${formatEuro(event.minConsumption)}` : "Nessuna",
    },
    {
      icon: Users,
      label: "Posti",
      value: event.seatsLimited
        ? `${event.seatsLeft} liberi su ${event.seatsTotal}`
        : "Illimitati",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} homeHref={homeHref} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} /> {backLabel}
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <article className="flex min-w-0 flex-col gap-6">
            <header className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 ring-1 ring-amber-400/30">
                <span className="ff-display text-xl font-bold text-amber-500 dark:text-amber-400">
                  {d.day}
                </span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  {d.month}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="h-5 rounded-full px-2 text-[10px]"
                  >
                    {eventKindLabel(event.kind)}
                  </Badge>
                  {event.openToAll && (
                    <Badge
                      variant="secondary"
                      className="h-5 rounded-full px-2 text-[10px]"
                    >
                      Aperto a tutti
                    </Badge>
                  )}
                </div>
                <h1 className="ff-display mt-1.5 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                  {event.title}
                </h1>
              </div>
            </header>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3">
              <VenueAvatar
                venue={{
                  id: event.venue.id,
                  name: event.venue.name,
                  logoPath: event.venue.logoPath,
                }}
                size={40}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {event.venue.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {event.venue.city}
                </p>
              </div>
            </div>

            {event.description && (
              <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base">
                {event.description}
              </p>
            )}

            {event.partnerVenues.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2 className="ff-display flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles size={15} className="text-muted-foreground" /> Locali partner
                </h2>
                <ul className="flex flex-col gap-2">
                  {event.partnerVenues.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 px-3 py-2 text-sm text-foreground"
                    >
                      <VenueAvatar venue={p} size={24} />
                      <span className="min-w-0 truncate">{p.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {p.city}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* Aside — facts + CTA */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <dl className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <EventActions
                event={event}
                role={session?.role ?? null}
                joined={joined}
                canManage={canManage}
                isPast={isPast}
              />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
