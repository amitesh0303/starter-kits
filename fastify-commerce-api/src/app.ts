import Fastify from "fastify";
import { healthRoutes } from "./routes/health.js";
import { productRoutes } from "./routes/products.js";
import { cartRoutes } from "./routes/cart.js";
import { checkoutRoutes } from "./routes/checkout.js";
import { authPlugin } from "./plugins/auth.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Register plugins
  await app.register(authPlugin);

  // Register routes
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(productRoutes, { prefix: "/api/products" });
  await app.register(cartRoutes, { prefix: "/api/cart" });
  await app.register(checkoutRoutes, { prefix: "/api/checkout" });

  return app;
}
