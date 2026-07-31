export interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
}

export function getConfig(): Config {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/realtime",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  };
}

export function isFakeMode(): boolean {
  const config = getConfig();
  return config.nodeEnv === "test";
}
