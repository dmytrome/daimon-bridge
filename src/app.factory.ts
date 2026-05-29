import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

const MAX_BODY_BYTES = 16 * 1024;

export interface CreateAppOptions {
  silent?: boolean;
}

export function createAdapter(): FastifyAdapter {
  return new FastifyAdapter({ bodyLimit: MAX_BODY_BYTES });
}

export async function configureApp(app: NestFastifyApplication): Promise<void> {
  await app.register(helmet);
  app.enableShutdownHooks();
}

export async function createApp(
  options: CreateAppOptions = {},
): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    createAdapter(),
    options.silent === true ? { logger: false } : {},
  );
  await configureApp(app);
  return app;
}
