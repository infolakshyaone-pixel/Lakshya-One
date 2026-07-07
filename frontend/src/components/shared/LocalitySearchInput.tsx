"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/shared/ui/input";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEBOUNCE_MS = 450;

export type LocalitySearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectLocality: (locality: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Debounced (1000ms) locality autocomplete input.
 * Hits GET {API_BASE}/api/schools/localities?q= directly on the
 * backend — same pattern as fetchCities() in lib/data/schools-public.ts.
 * No BFF proxy needed: this is public, read-only, unauthenticated data.
 *
 * Uses AbortController so a fast-typed earlier query can never resolve
 * after a later one and flash stale suggestions (plan.md risk table,
 * Frontend F1 mitigation).
 */
export function LocalitySearchInput({
  value,
  onChange,
  onSelectLocality,
  placeholder = "Search locality (e.g. Jhalwa)",
  className,
}: LocalitySearchInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = value.trim();

    if (!API_BASE || term.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);

      try {
        const res = await fetch(
          `${API_BASE}/api/schools/localities?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          setSuggestions([]);
          return;
        }

        const json = await res.json();
        const results = Array.isArray(json.data)
          ? (json.data as string[])
          : [];

        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  // Cancel any in-flight request if the component unmounts mid-search
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {isOpen && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
          {suggestions.map((locality) => (
            <li key={locality}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelectLocality(locality);
                  setIsOpen(false);
                }}
              >
                {locality}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isLoading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          …
        </span>
      )}
    </div>
  );
}