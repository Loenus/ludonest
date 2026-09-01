import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

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

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand + contact */}
          <div className="flex flex-col gap-3">
            <BrandLogo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Trova il tavolo. Trova la partita. Trova la tua gente.
            </p>
            <div className="mt-0.5 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail size={14} className="text-amber-500" />
                {CONTACT_EMAIL}
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-amber-500" />
                Roma, Italia
              </span>
            </div>
          </div>

          {/* Link columns */}
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

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center">
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
