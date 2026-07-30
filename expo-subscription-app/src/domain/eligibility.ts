/**
 * Pure eligibility rules for digital-goods purchases.
 *
 * Property 10: Digital purchases route ONLY through RevenueCat.
 * Stripe is never used for digital goods on mobile.
 */

export type PurchaseChannel = "revenuecat" | "stripe" | "direct";

export type ProductType = "digital" | "physical" | "service";

export interface Product {
  id: string;
  type: ProductType;
  name: string;
}

export interface EligibilityResult {
  eligible: boolean;
  channel: PurchaseChannel | null;
  reason: string;
}

/**
 * Determines the eligible purchase channel for a product.
 * Digital goods MUST go through RevenueCat on mobile.
 * Physical goods or services could use other channels.
 */
export function getEligibleChannel(product: Product): EligibilityResult {
  if (product.type === "digital") {
    return {
      eligible: true,
      channel: "revenuecat",
      reason: "Digital goods must be purchased through RevenueCat on mobile",
    };
  }

  if (product.type === "physical") {
    return {
      eligible: true,
      channel: "stripe",
      reason: "Physical goods can be purchased through Stripe",
    };
  }

  if (product.type === "service") {
    return {
      eligible: true,
      channel: "stripe",
      reason: "Services can be purchased through Stripe",
    };
  }

  return {
    eligible: false,
    channel: null,
    reason: "Unknown product type",
  };
}

/**
 * Validates that a digital purchase attempt is using RevenueCat.
 * Returns false if any other channel is attempted for digital goods.
 */
export function isValidDigitalPurchaseChannel(
  product: Product,
  attemptedChannel: PurchaseChannel
): boolean {
  if (product.type === "digital") {
    return attemptedChannel === "revenuecat";
  }
  // Non-digital goods can use any channel
  return true;
}
