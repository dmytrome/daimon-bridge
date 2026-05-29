import { Injectable } from "@nestjs/common";
import { Channel, Command } from "./command.schema";

export const MAX_PER_CHANNEL = 8;

@Injectable()
export class CommandQueueService {
  private readonly queues = new Map<Channel, Command[]>();

  enqueue(channel: Channel, payload: unknown): Command | null {
    let queue = this.queues.get(channel);
    if (queue === undefined) {
      queue = [];
      this.queues.set(channel, queue);
    }

    if (queue.length >= MAX_PER_CHANNEL) {
      return null;
    }

    const cmd: Command = {
      id: crypto.randomUUID(),
      channel,
      payload,
      createdAt: new Date().toISOString(),
    };
    queue.push(cmd);
    return cmd;
  }

  dequeue(channel: Channel): Command | null {
    return this.queues.get(channel)?.shift() ?? null;
  }
}
