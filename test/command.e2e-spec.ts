import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import {
  AUTH_HEADERS,
  AcceptedResponse,
  bootApp,
  drainChannel,
  setSensor,
  VALID_HAPTIC,
} from "./helpers";

interface PollResponse {
  command: {
    id: string;
    channel: string;
    payload: { intensity?: number };
  } | null;
}

describe("Command poll (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await setSensor(app);
    await drainChannel(app, "haptic");
    await drainChannel(app, "face");
    await drainChannel(app, "beep");
  });

  it("returns null when the channel is empty", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/command/poll?channel=haptic",
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ command: null });
  });

  it("returns 400 for an unknown channel", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/command/poll?channel=foo",
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when the channel query parameter is missing", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/command/poll",
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("dequeues commands in FIFO order on the same channel", async () => {
    const first = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: { ...VALID_HAPTIC, intensity: 0.1 },
      headers: AUTH_HEADERS,
    });
    const second = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: { ...VALID_HAPTIC, intensity: 0.9 },
      headers: AUTH_HEADERS,
    });
    const firstId = (first.json() as AcceptedResponse).accepted;
    const secondId = (second.json() as AcceptedResponse).accepted;

    const pollFirst = (
      await app.inject({
        method: "GET",
        url: "/command/poll?channel=haptic",
        headers: AUTH_HEADERS,
      })
    ).json() as PollResponse;
    const pollSecond = (
      await app.inject({
        method: "GET",
        url: "/command/poll?channel=haptic",
        headers: AUTH_HEADERS,
      })
    ).json() as PollResponse;
    const pollEmpty = (
      await app.inject({
        method: "GET",
        url: "/command/poll?channel=haptic",
        headers: AUTH_HEADERS,
      })
    ).json() as PollResponse;

    expect(pollFirst.command?.id).toBe(firstId);
    expect(pollFirst.command?.channel).toBe("haptic");
    expect(pollFirst.command?.payload.intensity).toBe(0.1);
    expect(pollSecond.command?.id).toBe(secondId);
    expect(pollEmpty.command).toBeNull();
  });

  it("dequeues a command only on the channel it was enqueued on", async () => {
    const enqueued = await app.inject({
      method: "POST",
      url: "/haptic",
      payload: VALID_HAPTIC,
      headers: AUTH_HEADERS,
    });
    const acceptedId = (enqueued.json() as AcceptedResponse).accepted;

    const wrongChannel = (
      await app.inject({
        method: "GET",
        url: "/command/poll?channel=face",
        headers: AUTH_HEADERS,
      })
    ).json() as PollResponse;
    expect(wrongChannel.command).toBeNull();

    const rightChannel = (
      await app.inject({
        method: "GET",
        url: "/command/poll?channel=haptic",
        headers: AUTH_HEADERS,
      })
    ).json() as PollResponse;
    expect(rightChannel.command?.id).toBe(acceptedId);
  });

  it("rejects an unauthenticated request with 401", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/command/poll?channel=haptic",
    });
    expect(res.statusCode).toBe(401);
  });
});
