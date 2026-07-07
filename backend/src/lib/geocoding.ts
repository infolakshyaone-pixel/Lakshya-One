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