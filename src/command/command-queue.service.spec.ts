import { describe, it, expect, beforeEach } from "vitest";
import {
  CommandQueueService,
  MAX_PER_CHANNEL,
} from "./command-queue.service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("CommandQueueService", () => {
  let service: CommandQueueService;

  beforeEach(() => {
    service = new CommandQueueService();
  });

  it("starts empty for every channel", () => {
    expect(service.dequeue("haptic")).toBeNull();
    expect(service.dequeue("face")).toBeNull();
    expect(service.dequeue("beep")).toBeNull();
  });

  it("returns the enqueued command with a UUID id and ISO timestamp", () => {
    const cmd = service.enqueue("haptic", { pattern: "single" });
    expect(cmd).not.toBeNull();
    expect(cmd?.id).toMatch(UUID_RE);
    expect(cmd?.channel).toBe("haptic");
    expect(cmd?.payload).toEqual({ pattern: "single" });
    expect(cmd?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("enqueues and dequeues in FIFO order", () => {
    const first = service.enqueue("haptic", { n: 1 });
    const second = service.enqueue("haptic", { n: 2 });
    const third = service.enqueue("haptic", { n: 3 });

    expect(service.dequeue("haptic")?.id).toBe(first?.id);
    expect(service.dequeue("haptic")?.id).toBe(second?.id);
    expect(service.dequeue("haptic")?.id).toBe(third?.id);
    expect(service.dequeue("haptic")).toBeNull();
  });

  it("isolates channels from each other", () => {
    const h = service.enqueue("haptic", {});
    const f = service.enqueue("face", {});

    expect(service.dequeue("beep")).toBeNull();
    expect(service.dequeue("face")?.id).toBe(f?.id);
    expect(service.dequeue("haptic")?.id).toBe(h?.id);
  });

  it("returns null once a channel reaches the cap", () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      expect(service.enqueue("haptic", { i })).not.toBeNull();
    }
    expect(service.enqueue("haptic", { overflow: true })).toBeNull();
  });

  it("re-accepts after dequeue frees a slot", () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      service.enqueue("haptic", { i });
    }
    expect(service.enqueue("haptic", { blocked: true })).toBeNull();

    service.dequeue("haptic");

    expect(service.enqueue("haptic", { nowOk: true })).not.toBeNull();
  });

  it("does not affect other channels when one is full", () => {
    for (let i = 0; i < MAX_PER_CHANNEL; i++) {
      service.enqueue("haptic", {});
    }
    expect(service.enqueue("haptic", {})).toBeNull();
    expect(service.enqueue("face", {})).not.toBeNull();
    expect(service.enqueue("beep", {})).not.toBeNull();
  });
});
