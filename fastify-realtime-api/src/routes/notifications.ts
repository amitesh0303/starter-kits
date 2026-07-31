import type { FastifyInstance } from "fastify";
import { getNotificationStore } from "../domain/notification-store.js";

export async function notificationRoutes(app: FastifyInstance) {
  const store = getNotificationStore();

  app.get("/", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      return store.getByUserId(userId);
    },
  });

  app.post("/", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const body = request.body as { targetUserId: string; message: string; type: string };
      return store.create(body.targetUserId, body.message, body.type);
    },
  });

  app.patch("/:id/read", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const { id } = request.params as { id: string };
      store.markAsRead(id);
      return { success: true };
    },
  });
}
