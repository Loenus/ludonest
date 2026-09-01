import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <BrandLogo />
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Accedi come giocatore
          </Link>
          <Link href="/partner/login" className="transition-colors hover:text-foreground">
            Diventa partner
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/70">Prototipo · v0.1 · Milano</p>
      </div>
    </footer>
  );
}
