export interface PaymentAdapter { createPaymentIntent(amount: number, currency: string): Promise<{clientSecret:string}>; confirmPayment(secret: string): Promise<{success:boolean}>; }
export function createFakePaymentAdapter(): PaymentAdapter {
  return { async createPaymentIntent(_a, _c) { return { clientSecret: "fake_" + Date.now() }; }, async confirmPayment(_s) { return { success: true }; } };
}
