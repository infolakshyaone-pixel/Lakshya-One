"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";

export const RADIUS_OPTIONS_KM = [1, 2, 3, 5, 8, 10] as const;
export const DEFAULT_RADIUS_KM = 5;

export type RadiusSelectorProps = {
  value: number;
  onChange: (radiusKm: number) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Radius dropdown for "Near Me" search.
 * Values mirror backend's ALLOWED_RADII_KM / DEFAULT_RADIUS_KM
 * (schools.controller.ts) — keep these in sync if backend changes.
 */
export function RadiusSelector({
  value,
  onChange,
  disabled,
  className,
}: RadiusSelectorProps) {
  return (
    <Select
      value={String(value)}
      onValueChange={(next) => onChange(Number(next))}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Radius" />
      </SelectTrigger>
      <SelectContent>
        {RADIUS_OPTIONS_KM.map((km) => (
          <SelectItem key={km} value={String(km)}>
            Within {km} km
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}