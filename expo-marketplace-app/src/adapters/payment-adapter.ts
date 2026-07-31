export interface PaymentAdapter { createPaymentIntent(amount: number, currency: string): Promise<{ clientSecret: string }>; confirmPayment(clientSecret: string): Promise<{ success: boolean }>; }
export function createFakePaymentAdapter(): PaymentAdapter {
  return {
    async createPaymentIntent(_a, _c) { return { clientSecret: "fake_secret_" + Date.now() }; },
    async confirmPayment(_cs) { return { success: true }; },
  };
}
