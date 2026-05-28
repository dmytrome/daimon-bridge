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
  VALID_BEEP,
} from "./helpers";

let currentSnapshot: { capturedAt: string; temperature: number; motion: boolean };

interface PollResponse {
  command: { id: string; channel: string; payload: unknown } | null;
}

describe("Beep (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    currentSnapshot = await setSensor(app);
    await drainChannel(app, "beep");
  });

  it("POST /beep enqueues and bundles the current sensor snapshot", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/beep",
      payload: VALID_BEEP,
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(201);

    const body = res.json() as AcceptedResponse;
    expect(body.accepted).toMatch(UUID_RE);
    expect(body.sensor).toEqual(currentSnapshot);
  });

  it("POST /beep rejects a frequency below the floor with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/beep",
      payload: { frequencyHz: 10, durationMs: 100 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /beep rejects a frequency above the ceiling with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/beep",
      payload: { frequencyHz: 20000, durationMs: 100 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /beep rejects a non-integer frequency with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/beep",
      payload: { frequencyHz: 440.5, durationMs: 100 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /beep returns 503 when the queue is full", async () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      const ok = await app.inject({
        method: "POST",
        url: "/beep",
        payload: VALID_BEEP,
        headers: AUTH_HEADERS,
      });
      expect(ok.statusCode).toBe(201);
    }

    const full = await app.inject({
      method: "POST",
      url: "/beep",
      payload: VALID_BEEP,
      headers: AUTH_HEADERS,
    });
    expect(full.statusCode).toBe(503);
  });

  it("POST /beep enqueues onto the beep channel only", async () => {
    await app.inject({
      method: "POST",
      url: "/beep",
      payload: VALID_BEEP,
      headers: AUTH_HEADERS,
    });

    const haptic = await app.inject({
      method: "GET",
      url: "/command/poll?channel=haptic",
      headers: AUTH_HEADERS,
    });
    const face = await app.inject({
      method: "GET",
      url: "/command/poll?channel=face",
      headers: AUTH_HEADERS,
    });
    const beep = await app.inject({
      method: "GET",
      url: "/command/poll?channel=beep",
      headers: AUTH_HEADERS,
    });

    expect((haptic.json() as PollResponse).command).toBeNull();
    expect((face.json() as PollResponse).command).toBeNull();
    const beepBody = beep.json() as PollResponse;
    expect(beepBody.command).not.toBeNull();
    expect(beepBody.command?.channel).toBe("beep");
    expect(beepBody.command?.payload).toEqual(VALID_BEEP);
  });
});
