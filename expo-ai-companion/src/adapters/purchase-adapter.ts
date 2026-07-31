export interface PurchaseOffering { id: string; name: string; priceString: string; }
export interface PurchaseAdapter {
  getOfferings(): Promise<PurchaseOffering[]>;
  purchase(offeringId: string): Promise<{ success: boolean }>;
  isPremium(): Promise<boolean>;
}

export function createFakePurchaseAdapter(): PurchaseAdapter {
  let premium = false;
  return {
    async getOfferings() { return [{ id: "ai_premium", name: "AI Premium", priceString: "$9.99" }]; },
    async purchase(_id) { premium = true; return { success: true }; },
    async isPremium() { return premium; },
  };
}
