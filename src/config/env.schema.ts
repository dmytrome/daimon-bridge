import { z } from "zod";

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "127.0.0.1";

export const ConfigSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
    HOST: z.string().min(1).default(DEFAULT_HOST),
    BRIDGE_TOKEN: z.string().min(1),
    DATABASE_URL: z.url(),
  })
  .transform((env) => ({
    port: env.PORT,
    host: env.HOST,
    bridgeToken: env.BRIDGE_TOKEN,
    databaseUrl: env.DATABASE_URL,
  }));

export type AppConfig = z.infer<typeof ConfigSchema>;

export function validateEnv(raw: Record<string, unknown>): AppConfig {
  return ConfigSchema.parse(raw);
}
