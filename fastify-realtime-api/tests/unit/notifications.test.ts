import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app.js";
import type { FastifyInstance } from "fastify";

describe("Notifications API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("requires auth to get notifications", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/notifications",
    });
    expect(response.statusCode).toBe(401);
  });

  it("returns empty notifications list", async () => {
    const token = app.jwt.sign({ sub: "user-1" });
    const response = await app.inject({
      method: "GET",
      url: "/api/notifications",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("creates a notification", async () => {
    const token = app.jwt.sign({ sub: "user-1" });
    const response = await app.inject({
      method: "POST",
      url: "/api/notifications",
      headers: { authorization: `Bearer ${token}` },
      payload: { targetUserId: "user-2", message: "Hello", type: "info" },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.message).toBe("Hello");
    expect(body.type).toBe("info");
    expect(body.read).toBe(false);
  });
});
