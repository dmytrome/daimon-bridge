import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { CommandQueueService } from "../command/command-queue.service";
import { Channel } from "../command/command.schema";
import { SensorService } from "../sensor/sensor.service";
import { SensorSnapshot } from "../sensor/sensor.schema";

export interface OutputResult {
  accepted: string;
  sensor: SensorSnapshot | null;
}

@Injectable()
export class OutputService {
  constructor(
    private readonly queue: CommandQueueService,
    private readonly sensor: SensorService,
  ) {}

  dispatch(channel: Channel, payload: unknown): OutputResult {
    const cmd = this.queue.enqueue(channel, payload);
    if (cmd === null) {
      throw new ServiceUnavailableException("queue full");
    }
    return { accepted: cmd.id, sensor: this.sensor.getLatest() };
  }
}
