import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createApp } from "../src/app.factory";
import { Channel } from "../src/command/command.schema";
import { MAX_PER_CHANNEL } from "../src/command/command-queue.service";

export const TEST_TOKEN = process.env.BRIDGE_TOKEN ?? "test-bridge-token";

export const AUTH_HEADERS = {
  authorization: `Bearer ${TEST_TOKEN}`,
};

export function freshSnapshot(): {
  capturedAt: string;
  temperature: number;
  motion: boolean;
} {
  return {
    capturedAt: new Date().toISOString(),
    temperature: 21.5,
    motion: true,
  };
}

export const VALID_HAPTIC = {
  pattern: "single" as const,
  intensity: 0.5,
  durationMs: 200,
};

export const VALID_FACE = {
  expression: "happy" as const,
  durationMs: 500,
};

export const VALID_BEEP = {
  frequencyHz: 440,
  durationMs: 150,
};

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export interface AcceptedResponse {
  accepted: string;
  sensor: ReturnType<typeof freshSnapshot> | null;
}

export async function bootApp(): Promise<NestFastifyApplication> {
  const app = await createApp({ silent: true });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

export async function drainChannel(
  app: NestFastifyApplication,
  channel: Channel,
): Promise<void> {
  for (let i = 0; i < MAX_PER_CHANNEL * 2; i++) {
    const res = await app.inject({
      method: "GET",
      url: `/command/poll?channel=${channel}`,
      headers: AUTH_HEADERS,
    });
    const body = res.json() as { command: unknown };
    if (body.command === null) {
      return;
    }
  }
}

export async function setSensor(
  app: NestFastifyApplication,
  snapshot: ReturnType<typeof freshSnapshot> = freshSnapshot(),
): Promise<ReturnType<typeof freshSnapshot>> {
  await app.inject({
    method: "POST",
    url: "/sensor/update",
    payload: snapshot,
    headers: AUTH_HEADERS,
  });
  return snapshot;
}
