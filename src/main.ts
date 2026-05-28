import "reflect-metadata";
import { createApp } from "./app.factory";

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "127.0.0.1";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const port = Number(process.env.PORT) || DEFAULT_PORT;
  const host = process.env.HOST ?? DEFAULT_HOST;
  await app.listen(port, host);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
