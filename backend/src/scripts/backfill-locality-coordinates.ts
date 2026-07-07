/**
 * One-time backfill script — geocodes existing schools' localities and
 * populates LocalityCoordinate cache + School.latitude/longitude.
 *
 * Run from backend/: npx ts-node src/scripts/backfill-locality-coordinates.ts
 * (or: npx tsx src/scripts/backfill-locality-coordinates.ts)
 *
 * Safe to re-run: skips schools that already have latitude/longitude set
 * (manual entry always wins — same rule as the live auto-geocode flow),
 * and skips localities already cached in LocalityCoordinate.
 *
 * Throttled at ~1.1s between Nominatim calls per Nominatim's usage policy
 * (max 1 req/sec). Failures are logged separately for manual review —
 * this script never crashes on a single geocode failure.
 */

import dotenv from "dotenv";

dotenv.config();

import prisma from "../lib/prisma";
import {
  geocodeLocality,
  geocodeCity,
  normalizeLocality,
} from "../lib/geocoding";

const THROTTLE_MS = 1100;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type FailureRecord = {
  locality: string;
  city: string;
  state: string;
  reason: "locality-and-city-failed" | "locality-failed-city-fallback-used";
};

const main = async (): Promise<void> => {
  console.log("Starting locality coordinate backfill...\n");

  // Schools that have a locality but no coordinates yet (manual coords always win —
  // if latitude/longitude already exist, leave them untouched).
  const schools = await prisma.school.findMany({
    where: {
      locality: { not: null },
      latitude: null,
      longitude: null,
    },
    select: { id: true, locality: true, city: true, state: true },
  });

  if (schools.length === 0) {
    console.log("No schools with a locality need backfilling.\n");
  } else {
    console.log(
      `Found ${schools.length} schools with a locality but no coordinates.\n`,
    );
  }

  // Distinct (locality, city, state) combos — geocode each unique combo once.
  type ComboEntry = { locality: string; city: string; state: string };
  const comboMap = new Map<string, ComboEntry>();

  for (const school of schools) {
    if (!school.locality) continue;
    const normalizedLocality = normalizeLocality(school.locality);
    const key = `${normalizedLocality}|${school.city}|${school.state}`;
    if (!comboMap.has(key)) {
      comboMap.set(key, {
        locality: normalizedLocality,
        city: school.city,
        state: school.state,
      });
    }
  }

  const combos = Array.from(comboMap.values());

  if (combos.length > 0) {
    console.log(
      `${combos.length} unique (locality, city, state) combos to geocode.\n`,
    );
  }

  const failures: FailureRecord[] = [];
  let geocoded = 0;
  let cacheHits = 0;

  for (let i = 0; i < combos.length; i++) {
    const { locality, city, state } = combos[i];
    const progress = `[${i + 1}/${combos.length}]`;

    const existing = await prisma.localityCoordinate.findUnique({
      where: { locality_city_state: { locality, city, state } },
    });

    if (existing) {
      console.log(
        `${progress} Cache hit — "${locality}, ${city}" already geocoded.`,
      );
      cacheHits++;
      continue;
    }

    console.log(`${progress} Geocoding "${locality}, ${city}, ${state}"...`);
    const result = await geocodeLocality(locality, city, state);

    if (result) {
      await prisma.localityCoordinate.create({
        data: {
          locality,
          city,
          state,
          latitude: result.latitude,
          longitude: result.longitude,
          source: "nominatim",
        },
      });
      console.log(`${progress}   ✅  ${result.latitude}, ${result.longitude}`);
      geocoded++;
    } else {
      console.log(
        `${progress}   ⚠️  Locality geocode failed, trying city fallback...`,
      );
      const cityResult = await geocodeCity(city, state);

      if (cityResult) {
        await prisma.localityCoordinate.create({
          data: {
            locality,
            city,
            state,
            latitude: cityResult.latitude,
            longitude: cityResult.longitude,
            source: "city-fallback",
          },
        });
        console.log(
          `${progress}   ✅  City fallback used: ${cityResult.latitude}, ${cityResult.longitude}`,
        );
        failures.push({
          locality,
          city,
          state,
          reason: "locality-failed-city-fallback-used",
        });
      } else {
        console.log(`${progress}   ❌  Both locality and city geocode failed.`);
        failures.push({
          locality,
          city,
          state,
          reason: "locality-and-city-failed",
        });
      }
    }

    // Throttle — Nominatim allows ~1 req/sec, stay safely under that.
    await sleep(THROTTLE_MS);
  }

  // ── Second pass: schools with NO locality but WITH an address, and no coords ──
  console.log("\nBackfilling address-only schools (no locality set)...\n");

  const addressOnlySchools = await prisma.school.findMany({
    where: {
      locality: null,
      latitude: null,
      longitude: null,
    },
    select: { id: true, name: true, address: true, city: true, state: true },
  });

  console.log(
    `Found ${addressOnlySchools.length} address-only schools needing coordinates.\n`,
  );

  let addressGeocoded = 0;
  let addressFailed = 0;

  for (let i = 0; i < addressOnlySchools.length; i++) {
    const school = addressOnlySchools[i];
    const progress = `[${i + 1}/${addressOnlySchools.length}]`;

    if (!school.address) continue;

    console.log(`${progress} Geocoding address for "${school.name}"...`);
    const result = await geocodeLocality(
      school.address,
      school.city,
      school.state,
    );

    if (result) {
      await prisma.school.update({
        where: { id: school.id },
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          coordinatesApproximate: false,
        },
      });
      console.log(`${progress}   ✅  ${result.latitude}, ${result.longitude}`);
      addressGeocoded++;
    } else {
      console.log(
        `${progress}   ⚠️  Address geocode failed, trying city fallback...`,
      );
      const cityResult = await geocodeCity(school.city, school.state);

      if (cityResult) {
        await prisma.school.update({
          where: { id: school.id },
          data: {
            latitude: cityResult.latitude,
            longitude: cityResult.longitude,
            coordinatesApproximate: true,
          },
        });
        console.log(
          `${progress}   ✅  City fallback used: ${cityResult.latitude}, ${cityResult.longitude}`,
        );
      } else {
        console.log(`${progress}   ❌  Both address and city geocode failed.`);
        addressFailed++;
      }
    }

    await sleep(THROTTLE_MS);
  }

  console.log("\n── Address-Only Backfill Summary ────────────");
  console.log(`Schools processed       : ${addressOnlySchools.length}`);
  console.log(`  Geocoded successfully : ${addressGeocoded}`);
  console.log(`  Failed completely     : ${addressFailed}`);

  // ── Apply cached locality coordinates to schools (locality-based pass) ──────
  console.log("\nApplying cached coordinates to schools...\n");

  let updatedCount = 0;

  for (const school of schools) {
    if (!school.locality) continue;
    const normalizedLocality = normalizeLocality(school.locality);

    const cached = await prisma.localityCoordinate.findUnique({
      where: {
        locality_city_state: {
          locality: normalizedLocality,
          city: school.city,
          state: school.state,
        },
      },
    });

    if (!cached) continue;

    await prisma.school.update({
      where: { id: school.id },
      data: {
        latitude: cached.latitude,
        longitude: cached.longitude,
        coordinatesApproximate: cached.source === "city-fallback",
      },
    });

    updatedCount++;
  }

  console.log("\n── Backfill Summary ─────────────────────────");
  console.log(`Unique combos processed : ${combos.length}`);
  console.log(`  Already cached        : ${cacheHits}`);
  console.log(`  Newly geocoded        : ${geocoded}`);
  console.log(`  Failed (see below)    : ${failures.length}`);
  console.log(`Schools updated         : ${updatedCount} / ${schools.length}`);

  if (failures.length > 0) {
    console.log("\n── Failures — needs manual review ───────────");
    for (const f of failures) {
      console.log(`  [${f.reason}] "${f.locality}, ${f.city}, ${f.state}"`);
    }
  }

  console.log("\nBackfill complete.");
};

main()
  .catch((error: unknown) => {
    console.error("Backfill script failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
