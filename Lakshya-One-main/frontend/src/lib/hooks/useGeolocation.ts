"use client";

import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "locating" | "success" | "error";

export type GeolocationErrorReason =
  | "unsupported"
  | "permission-denied"
  | "position-unavailable"
  | "timeout"
  | "unknown";

export type GeolocationState = {
  status: GeolocationStatus;
  coords: { lat: number; lng: number } | null;
  errorReason: GeolocationErrorReason | null;
};

const INITIAL_STATE: GeolocationState = {
  status: "idle",
  coords: null,
  errorReason: null,
};

/**
 * Wraps navigator.geolocation for the "Near Me" radius search flow.
 * This hook ONLY resolves the browser's lat/lng — it does not fetch
 * schools. Callers combine `coords` with fetchNearbySchools() from
 * lib/data/schools-public.ts.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(INITIAL_STATE);

  const locate = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ status: "error", coords: null, errorReason: "unsupported" });
      return;
    }

    setState({ status: "locating", coords: null, errorReason: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "success",
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          errorReason: null,
        });
      },
      (error) => {
        let reason: GeolocationErrorReason = "unknown";

        if (error.code === error.PERMISSION_DENIED) {
          reason = "permission-denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          reason = "position-unavailable";
        } else if (error.code === error.TIMEOUT) {
          reason = "timeout";
        }

        setState({ status: "error", coords: null, errorReason: reason });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, locate, reset };
}