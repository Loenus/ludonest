import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Coins, Sparkles, Users } from "lucide-react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Badge } from "@/components/ui/badge";
import { getSession, resolveHomePath } from "@/lib/auth";
import { DEFAULT_EVENT_ACCENT, eventKindLabel, formatEuro } from "@/lib/event-kind";
import { getEventViewerState, getPublicEvent } from "@/lib/events";
import { dayKey, formatEventDate, formatEventWhenLong, hasStarted, timeLabel } from "@/lib/format";
import { eventCoverUrl } from "@/lib/storage";
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
  // The accent only tints page elements (date, badges, primary button); it
  // never becomes a background. The hero exists only when there's a real cover.
  const accent = event.accentColor ?? DEFAULT_EVENT_ACCENT;
  const coverUrl = event.coverPath ? eventCoverUrl(event.coverPath) : null;
  const showHero = Boolean(coverUrl);
  const d = formatEventDate(dayKey(event.startsAt));

  const facts: { icon: typeof CalendarClock; label: string; value: string }[] = [
    { icon: CalendarClock, label: "Quando", value: formatEventWhenLong(event.startsAt) },
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

      <main className="flex-1">
        {showHero && (
          <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl!} alt="" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

            <Link
              href={backHref}
              aria-label={backLabel}
              className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/50 text-white backdrop-blur transition-colors hover:bg-slate-950/70"
            >
              <ArrowLeft size={17} />
            </Link>
          </div>
        )}

        {/* `relative z-10`: with a hero above, this later—but static—content
            would otherwise be painted under the hero's positioned overlay. */}
        <div
          className={`relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 ${
            showHero ? "-mt-12" : "pt-6 sm:pt-8"
          }`}
        >
          {!showHero && (
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:mb-8"
            >
              <ArrowLeft size={14} /> {backLabel}
            </Link>
          )}

          {/* Title card, lapping over the hero */}
          <div className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[0_18px_44px_rgba(50,32,16,0.14)] sm:gap-5 sm:p-6">
            {/* Left rail — date, then time under it */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border"
                style={{ backgroundColor: `${accent}1f`, borderColor: `${accent}40` }}
              >
                <span
                  className="ff-display text-xl font-bold leading-none"
                  style={{ color: accent }}
                >
                  {d.day}
                </span>
                <span className="mt-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                  {d.month}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-foreground">
                {timeLabel(event.startsAt)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="ff-display text-xl font-bold leading-tight text-foreground sm:text-2xl md:text-3xl">
                {event.title}
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <VenueAvatar
                  venue={{
                    id: event.venue.id,
                    name: event.venue.name,
                    logoPath: event.venue.logoPath,
                  }}
                  size={24}
                  className="shrink-0 ring-1 ring-border/60"
                />
                <p className="flex min-w-0 flex-col text-xs text-muted-foreground sm:text-sm">
                  <span className="truncate font-semibold text-foreground">
                    {event.venue.name}
                  </span>
                  <span className="truncate">{event.venue.address}</span>
                  <span className="truncate">{event.venue.city}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tags — below the card, before the description */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="h-6 rounded-full px-2.5 text-[11px]"
            >
              {eventKindLabel(event.kind)}
            </Badge>
            {event.openToAll && (
              <Badge
                variant="secondary"
                className="h-6 rounded-full px-2.5 text-[11px]"
              >
                Aperto a tutti
              </Badge>
            )}
          </div>

          <div className="mt-6 grid gap-6 pb-16 lg:grid-cols-[1fr_20rem]">
            <article className="flex min-w-0 flex-col gap-6">
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

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <dl className="flex flex-col gap-3">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
                      <div className="min-w-0">
                        <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 border-t border-border/60 pt-4">
                  <EventActions
                    event={event}
                    accent={accent}
                    role={session?.role ?? null}
                    joined={joined}
                    canManage={canManage}
                    isPast={isPast}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
