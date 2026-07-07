"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, LocateFixed, X } from "lucide-react";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { RadiusSelector, DEFAULT_RADIUS_KM } from "@/components/shared/RadiusSelector";

const ERROR_MESSAGES: Record<string, string> = {
  unsupported: "Location isn't supported on this device. Try searching by city instead.",
  "permission-denied": "Location access denied. Allow location access or search by city instead.",
  "position-unavailable": "Couldn't determine your location. Please try again.",
  timeout: "Location request timed out. Please try again.",
  unknown: "Something went wrong getting your location. Please try again.",
};

/**
 * "Near Me" toggle for the /schools listing page.
 * Resolves browser coords via useGeolocation, then pushes lat/lng/radius
 * into the URL — SchoolGrid (server component) reads these and switches
 * to fetchNearbySchools() instead of the normal filtered list.
 * Mutually exclusive with other filters (plan.md scope — Near Me is standalone).
 */
export default function NearMeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, coords, errorReason, locate, reset } = useGeolocation();

  const isActive = searchParams.has("lat") && searchParams.has("lng");
  const radius = Number(searchParams.get("radius")) || DEFAULT_RADIUS_KM;

  useEffect(() => {
    if (status === "success" && coords) {
      const params = new URLSearchParams();
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
      params.set("radius", String(radius));
      router.push(`/schools?${params.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, coords]);

  function handleRadiusChange(km: number) {
    if (!isActive) return;
    const params = new URLSearchParams();
    params.set("lat", searchParams.get("lat")!);
    params.set("lng", searchParams.get("lng")!);
    params.set("radius", String(km));
    router.push(`/schools?${params.toString()}`);
  }

  function handleDisable() {
    reset();
    router.push("/schools");
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 space-y-3">
      {!isActive ? (
        <button
          type="button"
          onClick={locate}
          disabled={status === "locating"}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-heading text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          <LocateFixed className="w-4 h-4" />
          {status === "locating" ? "Locating…" : "Use my location"}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-body text-blue-700 font-medium">
            <MapPin className="w-4 h-4" /> Near me
          </span>
          <button
            type="button"
            onClick={handleDisable}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isActive && (
        <RadiusSelector value={radius} onChange={handleRadiusChange} className="w-full" />
      )}

      {status === "error" && errorReason && (
        <p className="text-meta text-red-500 font-body">
          {ERROR_MESSAGES[errorReason] ?? ERROR_MESSAGES.unknown}
        </p>
      )}
    </div>
  );
}