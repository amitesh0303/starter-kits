import type { FastifyInstance } from "fastify";
import { getCartStore } from "../domain/cart-store.js";

export async function cartRoutes(app: FastifyInstance) {
  const store = getCartStore();

  app.get("/", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      return store.getCart(userId);
    },
  });

  app.post("/items", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      const body = request.body as { productId: string; quantity: number };
      return store.addItem(userId, body.productId, body.quantity);
    },
  });

  app.delete("/items/:productId", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      const { productId } = request.params as { productId: string };
      store.removeItem(userId, productId);
      return { success: true };
    },
  });
}
