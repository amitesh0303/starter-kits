import Fastify from "fastify";
import { healthRoutes } from "./routes/health.js";
import { notificationRoutes } from "./routes/notifications.js";
import { presenceRoutes } from "./routes/presence.js";
import { authPlugin } from "./plugins/auth.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Register plugins
  await app.register(authPlugin);

  // Register routes
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });
  await app.register(presenceRoutes, { prefix: "/api/presence" });

  return app;
}
