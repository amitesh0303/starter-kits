import type { FastifyInstance } from "fastify";
import { getPresenceStore } from "../domain/presence-store.js";

export async function presenceRoutes(app: FastifyInstance) {
  const store = getPresenceStore();

  app.get("/online", {
    preHandler: [(app as any).authenticate],
    handler: async () => {
      return store.getOnlineUsers();
    },
  });

  app.post("/heartbeat", {
    preHandler: [(app as any).authenticate],
    handler: async (request) => {
      const userId = (request as any).user.sub;
      store.heartbeat(userId);
      return { status: "ok" };
    },
  });
}
