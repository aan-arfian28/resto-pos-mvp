export type DeliveryDistance = "near" | "medium" | "far";

interface DeliveryMarkupConfig {
  near: number;
  medium: number;
  far: number;
}

const DEFAULT_MARKUPS: DeliveryMarkupConfig = {
  near: 3000,
  medium: 6000,
  far: 10000,
};

/**
 * Calculate delivery fee based on distance tier.
 */
export function calculateDeliveryFee(
  distance: DeliveryDistance | number,
  config?: Partial<DeliveryMarkupConfig>
): number {
  const markups = { ...DEFAULT_MARKUPS, ...config };

  if (typeof distance === "number") {
    if (distance <= 2) return markups.near;
    if (distance <= 5) return markups.medium;
    return markups.far;
  }

  return markups[distance] ?? markups.medium;
}

/**
 * Get distance tier from kilometers.
 */
export function getDistanceTier(kilometers: number): DeliveryDistance {
  if (kilometers <= 2) return "near";
  if (kilometers <= 5) return "medium";
  return "far";
}

export const DELIVERY_DISTANCES: { value: DeliveryDistance; label: string; maxKm: number }[] = [
  { value: "near", label: "Dekat (0-2 km)", maxKm: 2 },
  { value: "medium", label: "Sedang (2-5 km)", maxKm: 5 },
  { value: "far", label: "Jauh (5+ km)", maxKm: 10 },
];
