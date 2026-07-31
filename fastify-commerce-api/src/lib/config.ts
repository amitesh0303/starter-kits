export interface Config {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

export function getConfig(): Config {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/commerce",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
  };
}

export function isFakeMode(): boolean {
  const config = getConfig();
  return (
    config.stripeSecretKey === "sk_test_placeholder" ||
    config.nodeEnv === "test"
  );
}
