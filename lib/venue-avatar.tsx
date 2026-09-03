import type { ReactNode } from "react";

import { venueLogoUrl } from "@/lib/storage";

/**
 * Venue avatar. Renders the uploaded logo when there is one, otherwise a
 * deterministic themed mark (board-game glyph on a colour picked from the
 * venue id). No library, no stored file — the default is pure inline SVG.
 */

/* FNV-1a string hash -> uint32 */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* Warm "game-shelf" palette — every pair reads cleanly under a white glyph. */
const PALETTES: readonly [string, string][] = [
  ["#E8A93B", "#C07C17"], // amber
  ["#3FB89F", "#2B8C77"], // teal
  ["#E0637A", "#B5405A"], // coral
  ["#8B7FD6", "#655AB6"], // periwinkle
  ["#5AA9E6", "#3B7FBB"], // sky
  ["#6FBF73", "#4A9A55"], // leaf
  ["#D98A5F", "#B2653C"], // terracotta
  ["#C77DB5", "#9E568F"], // orchid
];

const MOTIFS = ["meeple", "hex", "die", "pawn", "cards"] as const;
type Motif = (typeof MOTIFS)[number];

function Glyph({ kind, detail }: { kind: Motif; detail: string }): ReactNode {
  switch (kind) {
    case "meeple":
      return (
        <path
          fill="#fff"
          d="M32 14c2.9 0 5.3 2.4 5.3 5.3 0 1.6-.7 3-1.8 4 4 .9 7.5 2.9 10 5.6 1.4 1.5 1 3.8-1 4.6l-5.4 2 2.2 9.3c.4 1.8-.9 3.5-2.8 3.5H23.3c-1.9 0-3.2-1.7-2.8-3.5l2.2-9.3-5.4-2c-2-.8-2.4-3.1-1-4.6 2.5-2.7 6-4.7 10-5.6a5.3 5.3 0 0 1-1.8-4c0-2.9 2.4-5.3 5.3-5.3Z"
        />
      );
    case "hex":
      return <path fill="#fff" d="M32 13 48 22.25V40.75L32 50 16 40.75V22.25L32 13Z" />;
    case "die":
      return (
        <g>
          <rect x="17" y="17" width="30" height="30" rx="7" fill="#fff" />
          <g fill={detail}>
            <circle cx="26" cy="26" r="2.7" />
            <circle cx="38" cy="26" r="2.7" />
            <circle cx="32" cy="32" r="2.7" />
            <circle cx="26" cy="38" r="2.7" />
            <circle cx="38" cy="38" r="2.7" />
          </g>
        </g>
      );
    case "pawn":
      return (
        <path
          fill="#fff"
          d="M32 15a5.5 5.5 0 0 1 3.9 9.4c2.4 1.5 4.1 4 4.5 7H23.6c.4-3 2.1-5.5 4.5-7A5.5 5.5 0 0 1 32 15Zm-9.5 19h19l-2.5 12.6c-.2 1-1 1.7-2 1.7H27c-1 0-1.8-.7-2-1.7L22.5 34Z"
        />
      );
    case "cards":
      return (
        <g fill="#fff">
          <rect
            x="19"
            y="23"
            width="16"
            height="22"
            rx="3"
            transform="rotate(-13 27 34)"
          />
          <rect
            x="29"
            y="20"
            width="16"
            height="22"
            rx="3"
            transform="rotate(11 37 31)"
            stroke={detail}
            strokeWidth="1.5"
          />
        </g>
      );
  }
}

export function GeneratedVenueAvatar({
  seed,
  size = 48,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const h = hash(seed || "ludonest");
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const kind = MOTIFS[(h >>> 9) % MOTIFS.length];
  const gid = `va-${h.toString(36)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="32" fill={`url(#${gid})`} />
      <Glyph kind={kind} detail={c2} />
    </svg>
  );
}

export function VenueAvatar({
  venue,
  size = 48,
  className = "",
}: {
  venue: { id: string; name: string; logoPath: string | null };
  size?: number;
  className?: string;
}) {
  if (venue.logoPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={venueLogoUrl(venue.logoPath)}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <GeneratedVenueAvatar
      seed={venue.id || venue.name}
      size={size}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}
