import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { MAX_PER_CHANNEL } from "../src/command/command-queue.service";
import {
  AUTH_HEADERS,
  AcceptedResponse,
  bootApp,
  drainChannel,
  setSensor,
  UUID_RE,
  VALID_HAPTIC,
} from "./helpers";

let currentSnapshot: { capturedAt: string; temperature: number; motion: boolean };

describe("Haptic (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    currentSnapshot = await setSensor(app);
    await drainChannel(app, "haptic");
  });

  it("POST /haptic enqueues and bundles the current sensor snapshot", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: VALID_HAPTIC,
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(201);

    const body = res.json() as AcceptedResponse;
    expect(body.accepted).toMatch(UUID_RE);
    expect(body.sensor).toEqual(currentSnapshot);
  });

  it("POST /haptic rejects an invalid body with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: { pattern: "weird", intensity: 2 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /haptic returns 503 when the queue is full", async () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      const ok = await app.inject({
        method: "POST",
        url: "/haptic",
        payload: VALID_HAPTIC,
        headers: AUTH_HEADERS,
      });
      expect(ok.statusCode).toBe(201);
    }

    const full = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: VALID_HAPTIC,
      headers: AUTH_HEADERS,
    });
    expect(full.statusCode).toBe(503);
  });

  it("rejects an unauthenticated request with 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: VALID_HAPTIC,
    });
    expect(res.statusCode).toBe(401);
  });
});
