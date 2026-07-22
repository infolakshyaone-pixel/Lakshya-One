/**
 * Locality-level geocoding via OpenStreetMap Nominatim (free tier).
 *
 * Design constraints (see plan.md — Location Radius Search + Locality Autocomplete):
 * - Never throws into the caller's request cycle. Always resolves — returns
 *   `null` on any failure (timeout, network error, no match, rate limit, etc).
 * - Callers are expected to invoke this asynchronously / fire-and-forget
 *   after the main request has already responded (see schools.controller.ts).
 * - Nominatim usage policy: max ~1 request/second, must set a descriptive
 *   User-Agent. The backfill script is responsible for throttling between
 *   calls; this module does not rate-limit itself since it's meant to be
 *   called once per unique locality (cache-checked by the caller first).
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_TIMEOUT_MS = 8000;

// Nominatim requires a descriptive User-Agent identifying the application.
// Do not remove — requests without one may be blocked/rate-limited harder.
const USER_AGENT = "LakshyaOne-SchoolPlatform/1.0 (contact: admin@lakshyaone.com)";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

/**
 * Normalizes a locality string for consistent cache lookups:
 * trims, lowercases, and collapses repeated whitespace.
 * e.g. "  Triveni   Puram " -> "triveni puram"
 */
export function normalizeLocality(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Geocodes a locality by querying Nominatim with locality + city + state
 * combined (never locality alone — avoids ambiguous cross-city matches).
 *
 * Returns `null` on any failure: timeout, network error, non-OK response,
 * or no results found. Never throws.
 */
export async function geocodeLocality(
  locality: string,
  city: string,
  state: string
): Promise<GeocodeResult | null> {
  const normalizedLocality = normalizeLocality(locality);

  if (!normalizedLocality || !city || !state) {
    return null;
  }

  const query = `${normalizedLocality}, ${city}, ${state}, India`;

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "in",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const [first] = results;
    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    // Timeout (AbortError), network failure, JSON parse failure, etc.
    // Swallow all errors — caller falls back to city-level centroid.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Geocodes a city centroid only (no locality) — used as the fallback when
 * a specific locality can't be geocoded. Same no-throw contract as above.
 */
export async function geocodeCity(city: string, state: string): Promise<GeocodeResult | null> {
  if (!city || !state) {
    return null;
  }

  const query = `${city}, ${state}, India`;

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "in",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    const [first] = results;
    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}



// ── Direct coordinate extraction from Google Maps URLs ────────────────────────

export interface MapUrlCoordsResult {
  latitude: number;
  longitude: number;
}

const COORD_PATTERNS: RegExp[] = [
  // !3d{lat}!4d{lng} — exact place pin (most accurate, prefer this first)
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  // https://www.google.com/maps/@25.4419,81.8394,17z — map viewport center (less precise)
  /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  // https://maps.google.com/maps?q=25.4419,81.8394
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  // https://maps.google.com/maps?ll=25.4419,81.8394
  /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
];

function parseCoordsFromText(text: string): MapUrlCoordsResult | null {
  for (const pattern of COORD_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);
      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      ) {
        return { latitude, longitude };
      }
    }
  }
  return null;
}

const SHORT_LINK_HOSTS = ["goo.gl", "maps.app.goo.gl"];

function isShortLink(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return SHORT_LINK_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

/**
 * Extracts lat/lng directly from a Google Maps URL — no geocoding service
 * call needed for standard share/embed links. Handles:
 *   .../@lat,lng,zoomz
 *   ...?q=lat,lng
 *   ...?ll=lat,lng
 *   ...!3dlat!4dlng   (place-page embed format)
 *
 * For shortened links (goo.gl / maps.app.goo.gl) it follows the redirect
 * once to resolve the real URL, then applies the same patterns to the
 * final URL and, as a last resort, the response body.
 *
 * Returns null if nothing can be extracted — caller should fall back to
 * locality/address/city geocoding in that case. Never throws.
 */
export async function extractCoordsFromMapUrl(
  mapUrl: string | null | undefined,
): Promise<MapUrlCoordsResult | null> {
  const url = mapUrl?.trim();
  if (!url) return null;

  const direct = parseCoordsFromText(url);
  if (direct) return direct;

  if (!isShortLink(url)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    const resolved = parseCoordsFromText(response.url);
    if (resolved) return resolved;

    const body = await response.text();
    return parseCoordsFromText(body);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}