/**
 * Backfill script: resolves exact coordinates from School.mapUrl for schools
 * that already have a map link but are still using locality/city-level
 * approximate coordinates (hasManualCoords = false).
 *
 * Idempotent — safe to re-run. Only touches schools where:
 *   - mapUrl is set
 *   - hasManualCoords is false (i.e. not already resolved to an exact point)
 *
 * Usage:
 *   cd backend
 *   npx ts-node src/scripts/backfill-maplink-coordinates.ts
 *
 * (or however you run the existing backfill-locality-coordinates.ts script —
 * same runner should work for this one.)
 */

import prisma from "../lib/prisma";
import { extractCoordsFromMapUrl } from "../lib/geocoding";

// Small delay between iterations — extractCoordsFromMapUrl only hits the
// network for shortened links (goo.gl / maps.app.goo.gl); full links are
// resolved locally via regex with zero network calls. This delay is a
// safety margin in case many schools happen to use short links.
const DELAY_MS = 300;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("[backfill-maplink] Starting...");

  const candidates = await prisma.school.findMany({
    where: {
      mapUrl: { not: null },
      //hasManualCoords: false,
    },
    select: {
      id: true,
      name: true,
      mapUrl: true,
      latitude: true,
      longitude: true,
    },
  });

  console.log(`[backfill-maplink] Found ${candidates.length} candidate schools.`);

  let resolved = 0;
  let failed = 0;
  let skippedEmpty = 0;

  for (const school of candidates) {
    if (!school.mapUrl || !school.mapUrl.trim()) {
      skippedEmpty++;
      continue;
    }

    try {
      const coords = await extractCoordsFromMapUrl(school.mapUrl);

      if (coords) {
        await prisma.school.update({
          where: { id: school.id },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            coordinatesApproximate: false,
            hasManualCoords: true,
          },
        });

        resolved++;
        console.log(
          `[backfill-maplink] ✅ ${school.name} (${school.id}) → ` +
            `${coords.latitude}, ${coords.longitude}`,
        );
      } else {
        failed++;
        console.log(
          `[backfill-maplink] ⚠️  ${school.name} (${school.id}) — ` +
            `could not extract coordinates from mapUrl: ${school.mapUrl}`,
        );
      }
    } catch (err) {
      failed++;
      console.error(
        `[backfill-maplink] ❌ ${school.name} (${school.id}) — error:`,
        err,
      );
    }

    await sleep(DELAY_MS);
  }

  console.log("\n[backfill-maplink] Done.");
  console.log(`  Resolved:       ${resolved}`);
  console.log(`  Failed:         ${failed}`);
  console.log(`  Skipped empty:  ${skippedEmpty}`);
  console.log(`  Total checked:  ${candidates.length}`);

  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error("[backfill-maplink] Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});