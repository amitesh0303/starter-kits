/**
 * Entitlement-unlock logic and feature-access rules.
 */

import { Entitlement, Feature } from "./entities";

/**
 * Determines whether a user can access a given feature
 * based on their active entitlements.
 */
export function canAccessFeature(
  feature: Feature,
  entitlements: Entitlement[]
): boolean {
  if (!feature.isPremium) {
    return true;
  }

  return entitlements.some((e) => e.isActive);
}

/**
 * Filters features into accessible and locked based on entitlements.
 */
export function partitionFeatures(
  features: Feature[],
  entitlements: Entitlement[]
): { accessible: Feature[]; locked: Feature[] } {
  const accessible: Feature[] = [];
  const locked: Feature[] = [];

  for (const feature of features) {
    if (canAccessFeature(feature, entitlements)) {
      accessible.push(feature);
    } else {
      locked.push(feature);
    }
  }

  return { accessible, locked };
}

/**
 * Checks if an entitlement is expired.
 */
export function isEntitlementExpired(entitlement: Entitlement): boolean {
  if (!entitlement.expiresAt) {
    return false; // Lifetime entitlement
  }
  return new Date(entitlement.expiresAt) < new Date();
}

/**
 * Reconciles entitlements: filters out expired ones and marks them inactive.
 */
export function reconcileEntitlements(
  entitlements: Entitlement[]
): Entitlement[] {
  return entitlements.map((e) => {
    if (isEntitlementExpired(e)) {
      return { ...e, isActive: false };
    }
    return e;
  });
}
