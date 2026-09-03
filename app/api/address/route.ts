import { NextResponse, type NextRequest } from "next/server";

/**
 * Address autocomplete proxy.
 *
 * Backed by Photon (https://photon.komoot.io) — OpenStreetMap data, free, no
 * API key, no billing. We proxy it (rather than calling from the browser) so we
 * can send a proper User-Agent, normalise the payload, cap the result set and
 * cache at the edge. Results are filtered to real Italian streets / addresses.
 */

const PHOTON = "https://photon.komoot.io/api/";
const MIN_QUERY = 6;

export interface AddressSuggestion {
  /** Street + house number, e.g. "Via dei Giochi 12". */
  address: string;
  city: string;
  postcode: string | null;
  lat: number;
  lng: number;
  /** Human label for the dropdown row. */
  label: string;
}

interface PhotonProps {
  type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  countrycode?: string;
}

interface PhotonFeature {
  properties?: PhotonProps;
  geometry?: { coordinates?: [number, number] };
}

function toSuggestion(feature: PhotonFeature): AddressSuggestion | null {
  const p = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length !== 2) return null;
  if ((p.countrycode ?? "").toUpperCase() !== "IT") return null;
  if (p.type !== "house" && p.type !== "street") return null;

  const city = p.city || p.town || p.village || p.county;
  if (!city) return null;

  const streetName = p.type === "house" ? p.street || p.name : p.name || p.street;
  if (!streetName) return null;

  const address =
    p.type === "house" && p.housenumber
      ? `${streetName} ${p.housenumber}`
      : streetName;

  const label = [address, [p.postcode, city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const [lng, lat] = coords;
  return { address, city, postcode: p.postcode ?? null, lat, lng, label };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < MIN_QUERY) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(PHOTON);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("lang", "default"); // local language — Italian for IT
  // Bias toward Italy (no hard country filter exists); we still filter by
  // countrycode below.
  url.searchParams.set("lat", "42.5");
  url.searchParams.set("lon", "12.5");

  let features: PhotonFeature[] = [];
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "tavolo-app/1.0 (venue address autocomplete)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: 502 });
    }
    const data = (await res.json()) as { features?: PhotonFeature[] };
    features = data.features ?? [];
  } catch {
    return NextResponse.json({ results: [] }, { status: 502 });
  }

  const seen = new Set<string>();
  const results: AddressSuggestion[] = [];
  for (const f of features) {
    const s = toSuggestion(f);
    if (!s || seen.has(s.label)) continue;
    seen.add(s.label);
    results.push(s);
  }

  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=600" } },
  );
}
