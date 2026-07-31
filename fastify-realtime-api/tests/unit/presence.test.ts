import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import type { FastifyInstance } from "fastify";

describe("Presence API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires auth for heartbeat", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/presence/heartbeat",
    });
    expect(response.statusCode).toBe(401);
  });

  it("sends heartbeat and appears online", async () => {
    const token = app.jwt.sign({ sub: "user-1" });
    await app.inject({
      method: "POST",
      url: "/api/presence/heartbeat",
      headers: { authorization: `Bearer ${token}` },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/presence/online",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].userId).toBe("user-1");
    expect(body[0].online).toBe(true);
  });
});
