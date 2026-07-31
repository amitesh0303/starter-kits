import type { FastifyInstance } from "fastify";
import { getProductStore } from "../domain/product-store.js";

export async function productRoutes(app: FastifyInstance) {
  const store = getProductStore();

  app.get("/", async () => {
    return store.list();
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const product = store.getById(request.params.id);
    if (!product) {
      return reply.status(404).send({ error: "Product not found" });
    }
    return product;
  });

  app.post("/", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const body = request.body as { name: string; price: number; description?: string };
      return store.create(body);
    },
  });
}
