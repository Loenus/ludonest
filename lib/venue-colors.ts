import { PALETTE_COLORS, paletteIndexFor, venuePaletteColor } from "@/lib/venue-avatar";

export const DEFAULT_SPINE_COLOR = PALETTE_COLORS[0];

interface ColorableVenue {
  id: string;
  logoPath: string | null;
}

/**
 * Spine colour per venue, for a whole grid at once. A venue still on the
 * generated default avatar gets that avatar's own colour, so the accent bar
 * and the avatar visually match. A venue with an uploaded logo (whose avatar
 * colour isn't meaningful) instead gets a colour not already used elsewhere
 * in the grid — picked deterministically from its id, so it doesn't repaint
 * on every re-render.
 */
export function assignSpineColors(venues: ColorableVenue[]): Map<string, string> {
  const used = new Set<string>();
  const result = new Map<string, string>();

  for (const v of venues) {
    if (!v.logoPath) {
      const color = venuePaletteColor(v.id);
      result.set(v.id, color);
      used.add(color);
    }
  }

  for (const v of venues) {
    if (v.logoPath) {
      const start = paletteIndexFor(v.id);
      let chosen = PALETTE_COLORS[start];
      for (let i = 0; i < PALETTE_COLORS.length; i++) {
        const candidate = PALETTE_COLORS[(start + i) % PALETTE_COLORS.length];
        if (!used.has(candidate)) {
          chosen = candidate;
          break;
        }
      }
      result.set(v.id, chosen);
      used.add(chosen);
    }
  }

  return result;
}
