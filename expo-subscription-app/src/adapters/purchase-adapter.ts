/**
 * Purchase adapter wrapping RevenueCat with fake default.
 * Digital goods ONLY go through RevenueCat (Property 10).
 */

import { Entitlement } from "../domain/entities";

export interface PurchaseOffering {
  id: string;
  name: string;
  priceString: string;
}

export interface PurchaseAdapter {
  initialize(apiKey: string | null): Promise<void>;
  getOfferings(): Promise<PurchaseOffering[]>;
  purchase(offeringId: string): Promise<Entitlement>;
  restorePurchases(): Promise<Entitlement[]>;
  getActiveEntitlements(): Promise<Entitlement[]>;
}

/**
 * Creates a fake purchase adapter for development/testing.
 */
export function createFakePurchaseAdapter(userId: string): PurchaseAdapter {
  const entitlements: Entitlement[] = [];

  const fakeOfferings: PurchaseOffering[] = [
    { id: "monthly_premium", name: "Premium Monthly", priceString: "$9.99/mo" },
    { id: "annual_premium", name: "Premium Annual", priceString: "$99.99/yr" },
  ];

  return {
    async initialize(_apiKey: string | null): Promise<void> {
      // No-op for fake
    },

    async getOfferings(): Promise<PurchaseOffering[]> {
      return fakeOfferings;
    },

    async purchase(offeringId: string): Promise<Entitlement> {
      const entitlement: Entitlement = {
        id: `ent-${Date.now()}`,
        profileId: userId,
        productId: offeringId,
        isActive: true,
        expiresAt: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        purchasedAt: new Date().toISOString(),
        source: "revenuecat",
      };
      entitlements.push(entitlement);
      return entitlement;
    },

    async restorePurchases(): Promise<Entitlement[]> {
      return [...entitlements];
    },

    async getActiveEntitlements(): Promise<Entitlement[]> {
      return entitlements.filter((e) => e.isActive);
    },
  };
}
