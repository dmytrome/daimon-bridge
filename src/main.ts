import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { createApp } from "./app.factory";
import { AppConfig } from "./config/env.schema";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get("port", { infer: true });
  const host = config.get("host", { infer: true });
  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
