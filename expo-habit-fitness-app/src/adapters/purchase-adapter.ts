export interface PurchaseOffering { id: string; name: string; priceString: string; }
export interface PurchaseAdapter { getOfferings(): Promise<PurchaseOffering[]>; purchase(id: string): Promise<{ success: boolean }>; isPremium(): Promise<boolean>; }
export function createFakePurchaseAdapter(): PurchaseAdapter {
  let premium = false;
  return { async getOfferings() { return [{ id: "pro", name: "Pro", priceString: "$6.99" }]; }, async purchase(_id) { premium = true; return { success: true }; }, async isPremium() { return premium; } };
}
