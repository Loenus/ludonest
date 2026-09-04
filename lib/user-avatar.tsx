import { avatarUrl } from "@/lib/storage";

/**
 * Player avatar. Renders the uploaded photo when there is one, otherwise a
 * deterministic themed initials mark (colour picked from the user id) — same
 * treatment as {@link import("@/lib/venue-avatar").VenueAvatar}, no library,
 * no stored file for the default.
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

/* Warm "game-shelf" palette — every pair reads cleanly under white text. */
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

/** "Mario Rossi" -> "MR", "Mario" -> "M", "" -> "?" */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
}

export function GeneratedUserAvatar({
  seed,
  name,
  size = 48,
  className = "",
}: {
  seed: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const h = hash(seed || name || "ludonest");
  const [c1, c2] = PALETTES[h % PALETTES.length];
  const gid = `ua-${h.toString(36)}`;

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
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="24"
        fontWeight="700"
        fontFamily="var(--font-heading, ui-sans-serif), system-ui, sans-serif"
      >
        {initials(name)}
      </text>
    </svg>
  );
}

export function UserAvatar({
  user,
  size = 48,
  className = "",
}: {
  user: { id: string; fullName: string; avatarPath: string | null };
  size?: number;
  className?: string;
}) {
  if (user.avatarPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl(user.avatarPath)}
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
    <GeneratedUserAvatar
      seed={user.id}
      name={user.fullName}
      size={size}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}
