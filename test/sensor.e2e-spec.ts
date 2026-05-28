import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AUTH_HEADERS, bootApp, freshSnapshot } from "./helpers";

describe("Sensor (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /sensor/now returns null when nothing has been set", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/sensor/now",
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toBeNull();
  });

  it("POST /sensor/update stores and echoes the snapshot", async () => {
    const snapshot = freshSnapshot();
    const res = await app.inject({
      method: "POST",
      url: "/sensor/update",
      payload: snapshot,
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual(snapshot);

    const now = await app.inject({
      method: "GET",
      url: "/sensor/now",
      headers: AUTH_HEADERS,
    });
    expect(now.statusCode).toBe(200);
    expect(now.json()).toEqual(snapshot);
  });

  it("POST /sensor/update rejects an invalid payload with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/sensor/update",
      payload: { temperature: "hot" },
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /sensor/update rejects a stale capturedAt with 400", async () => {
    const stale = {
      ...freshSnapshot(),
      capturedAt: "2020-01-01T00:00:00.000Z",
    };
    const res = await app.inject({
      method: "POST",
      url: "/sensor/update",
      payload: stale,
      headers: AUTH_HEADERS,
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects an unauthenticated request with 401", async () => {
    const res = await app.inject({ method: "GET", url: "/sensor/now" });
    expect(res.statusCode).toBe(401);
  });
});
