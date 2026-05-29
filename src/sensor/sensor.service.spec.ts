import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryAgentPublisher } from "../agent/in-memory-agent-publisher";
import { InMemorySensorRepository } from "./in-memory-sensor.repository";
import { SensorService } from "./sensor.service";
import type { SensorSnapshot } from "./sensor.schema";

const snapshot = (overrides: Partial<SensorSnapshot> = {}): SensorSnapshot => ({
  capturedAt: "2026-05-28T19:00:00.000Z",
  temperature: 21.5,
  motion: false,
  ...overrides,
});

describe("SensorService", () => {
  let service: SensorService;
  let repository: InMemorySensorRepository;
  let publisher: InMemoryAgentPublisher;

  beforeEach(() => {
    repository = new InMemorySensorRepository();
    publisher = new InMemoryAgentPublisher();
    service = new SensorService(repository, publisher);
  });

  it("returns null before any snapshot is set", () => {
    expect(service.getLatest()).toBeNull();
  });

  it("stores and returns the latest snapshot", () => {
    const snap = snapshot();
    service.setLatest(snap);
    expect(service.getLatest()).toEqual(snap);
  });

  it("overwrites the previous snapshot", () => {
    service.setLatest(snapshot({ temperature: 10 }));
    service.setLatest(snapshot({ temperature: 30 }));
    expect(service.getLatest()?.temperature).toBe(30);
  });

  it("persists each snapshot to the repository", async () => {
    const snap = snapshot();
    service.setLatest(snap);
    await Promise.resolve();
    expect(repository.saved).toEqual([snap]);
  });

  it("forwards each snapshot to the agent", async () => {
    const snap = snapshot();
    service.setLatest(snap);
    await Promise.resolve();
    expect(publisher.published).toEqual([snap]);
  });
});
