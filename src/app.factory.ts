import { NestFactory } from "@nestjs/core";
import helmet from "@fastify/helmet";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

const MAX_BODY_BYTES = 16 * 1024;

export interface CreateAppOptions {
  silent?: boolean;
}

export async function createApp(
  options: CreateAppOptions = {},
): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({ bodyLimit: MAX_BODY_BYTES });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    options.silent === true ? { logger: false } : {},
  );
  await app.register(helmet);
  app.enableShutdownHooks();
  return app;
}
