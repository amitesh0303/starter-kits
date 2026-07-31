/**
 * RevenueCat purchase adapter with fake for testing.
 */

export interface PurchaseOffering {
  id: string;
  name: string;
  priceString: string;
}

export interface PurchaseAdapter {
  getOfferings(): Promise<PurchaseOffering[]>;
  purchase(offeringId: string): Promise<{ success: boolean }>;
  restorePurchases(): Promise<boolean>;
  isPremium(): Promise<boolean>;
}

export function createFakePurchaseAdapter(): PurchaseAdapter {
  let premium = false;

  return {
    async getOfferings(): Promise<PurchaseOffering[]> {
      return [
        { id: "premium_monthly", name: "Premium Monthly", priceString: "$4.99" },
        { id: "premium_yearly", name: "Premium Yearly", priceString: "$29.99" },
      ];
    },
    async purchase(_offeringId: string): Promise<{ success: boolean }> {
      premium = true;
      return { success: true };
    },
    async restorePurchases(): Promise<boolean> {
      return premium;
    },
    async isPremium(): Promise<boolean> {
      return premium;
    },
  };
}
