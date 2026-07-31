import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import type { FastifyInstance } from "fastify";

describe("Checkout API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires auth for checkout", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/checkout",
      payload: { items: [{ priceId: "price_123", quantity: 1 }] },
    });
    expect(response.statusCode).toBe(401);
  });

  it("creates checkout session with fake provider", async () => {
    const token = app.jwt.sign({ sub: "user-1" });
    const response = await app.inject({
      method: "POST",
      url: "/api/checkout",
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ priceId: "price_123", quantity: 1 }] },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.url).toContain("checkout.stripe.com");
    expect(body.sessionId).toBeDefined();
  });
});
