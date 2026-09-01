import Link from "next/link";
import { Mail } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

const CONTACT_EMAIL = "ciao@ludonest.it";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Prodotto",
    links: [
      { label: "Come funziona", href: "#" },
      { label: "Eventi e tornei", href: "#" },
      { label: "Locali partner", href: "#" },
    ],
  },
  {
    title: "Azienda",
    links: [
      { label: "Chi siamo", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Lavora con noi", href: "#" },
    ],
  },
  {
    title: "Legale",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Termini di servizio", href: "#" },
      { label: "Cookie", href: "#" },
    ],
  },
];

const FLAT_LINKS = COLUMNS.flatMap((c) => c.links);

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          {/* Brand + contact */}
          <div className="flex flex-col items-center gap-2.5 sm:items-start">
            <BrandLogo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Trova il tavolo. Trova la partita. Trova la tua gente.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail size={14} className="text-amber-500" />
              {CONTACT_EMAIL}
            </a>
          </div>

          {/* Link columns — sm and up */}
          <div className="hidden gap-12 sm:flex lg:gap-16">
            {COLUMNS.map((col) => (
              <nav key={col.title} className="flex flex-col gap-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Flat link row — mobile only */}
        <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:hidden">
          {FLAT_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-border/50 pt-5 text-center sm:mt-8 sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} LudoNest · Prototipo v0.1 · Roma
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LudoNest su Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-amber-400/50 hover:text-foreground"
            >
              <InstagramIcon size={15} />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label="Scrivici una mail"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-amber-400/50 hover:text-foreground"
            >
              <Mail size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
