import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { bootApp } from "./helpers";

describe("Health (e2e)", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await bootApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health returns ok: true without auth", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
  });
});
