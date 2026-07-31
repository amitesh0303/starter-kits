import type { FastifyInstance } from "fastify";
import { getBillingProvider } from "../lib/billing-provider.js";

export async function checkoutRoutes(app: FastifyInstance) {
  app.post("/", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      const body = request.body as { items: { priceId: string; quantity: number }[] };
      const billing = getBillingProvider();
      return billing.createCheckoutSession(userId, body.items);
    },
  });
}
