/**
 * Haversine distance in kilometres between two lat/lng points.
 * Zero-cost client-side calculation — no API calls needed.
 */
export const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(6371 * c).toFixed(2);
};

/** Maximum delivery radius from any branch. Must match backend config. */
export const MAX_DELIVERY_RADIUS_KM = 40;

/**
 * Validate whether a delivery address is within range of a branch.
 * Returns { valid, distanceKm, message }
 */
export const validateDeliveryRange = (branch, deliveryLat, deliveryLng) => {
  if (!branch || typeof branch.latitude !== 'number' || typeof branch.longitude !== 'number') {
    return { valid: false, distanceKm: 0, message: 'Branch coordinates not configured.' };
  }
  if (typeof deliveryLat !== 'number' || typeof deliveryLng !== 'number') {
    return { valid: false, distanceKm: 0, message: 'Delivery coordinates not available.' };
  }
  const distanceKm = haversineDistanceKm(deliveryLat, deliveryLng, branch.latitude, branch.longitude);
  if (distanceKm > MAX_DELIVERY_RADIUS_KM) {
    return {
      valid: false,
      distanceKm,
      message: `Your delivery address is ${distanceKm} km away — outside the ${MAX_DELIVERY_RADIUS_KM} km delivery range of ${branch.name || branch.city}. Please select a closer branch or update your delivery address.`,
    };
  }
  return { valid: true, distanceKm, message: `Within delivery range (${distanceKm} km)` };
};
