import { buildApp } from "./app.js";
import { getConfig } from "./lib/config.js";

const config = getConfig();

async function start() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server running on port ${config.port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
