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
  VALID_FACE,
} from "./helpers";

let currentSnapshot: { capturedAt: string; temperature: number; motion: boolean };

interface PollResponse {
  command: { id: string; channel: string; payload: unknown } | null;
}

describe("Face (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    currentSnapshot = await setSensor(app);
    await drainChannel(app, "face");
  });

  it("POST /face enqueues and bundles the current sensor snapshot", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/face",
      payload: VALID_FACE,
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(201);

    const body = res.json() as AcceptedResponse;
    expect(body.accepted).toMatch(UUID_RE);
    expect(body.sensor).toEqual(currentSnapshot);
  });

  it("POST /face rejects an unknown expression with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/face",
      payload: { expression: "smug", durationMs: 200 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /face rejects a duration over the cap with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/face",
      payload: { expression: "happy", durationMs: 999999 },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /face returns 503 when the queue is full", async () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      const ok = await app.inject({
        method: "POST",
        url: "/face",
        payload: VALID_FACE,
        headers: AUTH_HEADERS,
      });
      expect(ok.statusCode).toBe(201);
    }

    const full = await app.inject({
      method: "POST",
      url: "/face",
      payload: VALID_FACE,
      headers: AUTH_HEADERS,
    });
    expect(full.statusCode).toBe(503);
  });

  it("POST /face enqueues onto the face channel only", async () => {
    await app.inject({
      method: "POST",
      url: "/face",
      payload: VALID_FACE,
      headers: AUTH_HEADERS,
    });

    const haptic = await app.inject({
      method: "GET",
      url: "/command/poll?channel=haptic",
      headers: AUTH_HEADERS,
    });
    const beep = await app.inject({
      method: "GET",
      url: "/command/poll?channel=beep",
      headers: AUTH_HEADERS,
    });
    const face = await app.inject({
      method: "GET",
      url: "/command/poll?channel=face",
      headers: AUTH_HEADERS,
    });

    expect((haptic.json() as PollResponse).command).toBeNull();
    expect((beep.json() as PollResponse).command).toBeNull();
    const faceBody = face.json() as PollResponse;
    expect(faceBody.command).not.toBeNull();
    expect(faceBody.command?.channel).toBe("face");
    expect(faceBody.command?.payload).toEqual(VALID_FACE);
  });
});
