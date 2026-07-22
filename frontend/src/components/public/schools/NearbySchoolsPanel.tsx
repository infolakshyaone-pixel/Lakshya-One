"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { RadiusSelector, DEFAULT_RADIUS_KM } from "@/components/shared/RadiusSelector";
import { IMAGE_BLUR_DATA_URL } from "@/lib/upload/image-placeholder";
import { optimizeCloudinaryUrl } from "@/lib/upload/cloudinary-url";
import type { NearbySchool } from "@/lib/data/schools-public";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const BOARD_LABEL: Record<string, string> = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  IB: "IB",
  IGCSE: "IGCSE / Cambridge",
  NIOS: "NIOS",
  STATE_BOARD: "State Board",
  UP_BOARD: "UP Board",
  OTHER: "Other Board",
};

// Builds a location line while skipping parts already contained in a
// previous part (address sometimes already includes locality/city/state).
function buildLocationLine(parts: Array<string | null | undefined>) {
  const result: string[] = [];
  for (const raw of parts) {
    const part = raw?.trim();
    if (!part) continue;
    const norm = part.toLowerCase();
    const alreadyPresent = result.some((r) => {
      const rNorm = r.toLowerCase();
      return rNorm.includes(norm) || norm.includes(rNorm);
    });
    if (alreadyPresent) continue;
    result.push(part);
  }
  return result.join(", ");
}

/**
 * Nearby Schools card on the school detail page — with a live radius selector.
 * Initial data comes server-rendered (SSR) at DEFAULT_RADIUS_KM; changing the
 * radius re-fetches directly from the public backend (same pattern as
 * LocalitySearchInput — no BFF proxy needed, this is public read-only data).
 */
export default function NearbySchoolsPanel({
  initialSchools,
  lat,
  lng,
  excludeId,
}: {
  initialSchools: NearbySchool[];
  lat: number;
  lng: number;
  excludeId: string;
}) {
  const [schools, setSchools] = useState(initialSchools);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_KM);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRadiusChange(km: number) {
    setRadius(km);
    if (!API_BASE) return;

    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(km),
        limit: "4",
        excludeId,
      });
      const res = await fetch(`${API_BASE}/api/schools/nearby?${query.toString()}`);
      if (!res.ok) return;
      const json = await res.json();
      const results = Array.isArray(json.data)
        ? (json.data as NearbySchool[])
        : Array.isArray(json.schools)
          ? (json.schools as NearbySchool[])
          : [];
      setSchools(results);
    } catch {
      // Network failure — keep showing previous results rather than clearing
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-heading font-bold text-h2 text-gray-800">
            Nearby Schools
          </h2>
          <p className="font-body text-body-sm text-gray-400 mt-1">
            Other approved schools near this location.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RadiusSelector value={radius} onChange={handleRadiusChange} className="w-32" />
          <Link
            href="/schools"
            className="text-sm font-heading font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        </div>
      ) : schools.length === 0 ? (
        <p className="font-body text-body text-gray-400 text-center py-6">
          No schools found within {radius} km. Try a larger radius.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schools.map((school) => {
            // Full address line — falls back to locality/city/state if address is missing,
            // and skips any part already contained in an earlier part.
            const locationLine = buildLocationLine([
              school.address,
              school.locality,
              school.city,
              school.state,
            ]);

            return (
              <Link
                key={school.id}
                href={`/schools/${school.slug}`}
                className="group rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {school.logoUrl ? (
                      <Image
                        src={optimizeCloudinaryUrl(school.logoUrl, { width: 96 }) ?? school.logoUrl}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-heading font-bold text-blue-600 text-sm">
                        {school.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-semibold text-body text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {school.name}
                    </h3>
                    <p className="font-body text-label text-gray-500 mt-1 line-clamp-2">
                      {locationLine || "Address not available"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {school.board && (
                        <span className="px-2 py-0.5 rounded-full bg-white border border-gray-100 text-meta text-gray-600">
                          {BOARD_LABEL[school.board as string] ?? school.board}
                        </span>
                      )}
                      {typeof school.distanceKm === "number" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-meta text-blue-700">
                          {school.distanceKm} km away
                        </span>
                      )}
                      {school.coordinatesApproximate && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-meta text-amber-700">
                          Approx. location
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}