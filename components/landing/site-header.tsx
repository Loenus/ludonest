import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

const CTA_CLASS =
  "h-9 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 text-xs font-semibold text-slate-950 shadow-md shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-lg";

export function SiteHeader({
  session,
  homeHref,
}: {
  session: Session | null;
  homeHref: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="LudoNest — home">
          <BrandLogo />
        </Link>

        {session ? (
          <Link
            href={homeHref ?? HOME_PATH[session.role]}
            className={cn(buttonVariants(), CTA_CLASS)}
          >
            Vai alla tua area
          </Link>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/partner/login"
              className="hidden text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sei un gestore?
            </Link>
            <Link href="/login" className={cn(buttonVariants(), CTA_CLASS)}>
              Accedi
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
