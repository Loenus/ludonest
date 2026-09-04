import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { PublicEventsList } from "@/components/events/public-events-list";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getSession, resolveHomePath } from "@/lib/auth";
import { listPublicEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Eventi disponibili · LudoNest",
  description:
    "Tornei, serate a tema, open day e campagne nei ludopub e locali da gioco della rete LudoNest.",
};

export default async function EventiPage() {
  const session = await getSession();
  const homeHref = session ? await resolveHomePath(session) : null;
  const events = await listPublicEvents();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} homeHref={homeHref} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <CalendarDays size={12} /> Eventi
          </span>
          <h1 className="ff-display text-3xl font-bold text-foreground sm:text-4xl">
            Eventi disponibili
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tornei, serate a tema, open day e campagne nei locali della rete. Apri
            un evento per tutti i dettagli
            {session?.role === "player"
              ? " e per partecipare."
              : session?.role === "manager"
                ? "; i tuoi eventi puoi anche modificarli."
                : ". Accedi come giocatore per partecipare."}
          </p>
        </header>

        <div className="mt-8">
          <PublicEventsList events={events} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
