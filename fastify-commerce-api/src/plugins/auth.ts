import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { getConfig } from "../lib/config.js";

async function auth(app: FastifyInstance) {
  const config = getConfig();
  await app.register(fastifyJwt, {
    secret: config.jwtSecret,
  });

  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });
}

export const authPlugin = fp(auth, { name: "auth" });
