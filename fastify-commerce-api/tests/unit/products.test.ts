import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import type { FastifyInstance } from "fastify";

describe("Products API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns empty products list initially", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("returns 404 for non-existent product", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products/non-existent",
    });
    expect(response.statusCode).toBe(404);
  });

  it("requires auth to create a product", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      payload: { name: "Widget", price: 999 },
    });
    expect(response.statusCode).toBe(401);
  });

  it("creates a product with valid auth", async () => {
    const token = app.jwt.sign({ sub: "user-1" });
    const response = await app.inject({
      method: "POST",
      url: "/api/products",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Widget", price: 999, description: "A test widget" },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.name).toBe("Widget");
    expect(body.price).toBe(999);
    expect(body.id).toBeDefined();
  });
});
