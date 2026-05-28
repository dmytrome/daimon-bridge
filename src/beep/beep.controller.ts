import {
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CommandQueueService } from "../command/command-queue.service";
import { SensorService } from "../sensor/sensor.service";
import { SensorSnapshot } from "../sensor/sensor.schema";
import { BeepDto } from "./beep.schema";

@Controller("beep")
export class BeepController {
  constructor(
    private readonly queue: CommandQueueService,
    private readonly sensor: SensorService,
  ) {}

  @Post()
  create(
    @Body() body: BeepDto,
  ): { accepted: string; sensor: SensorSnapshot | null } {
    const cmd = this.queue.enqueue("beep", body);
    if (cmd === null) {
      throw new ServiceUnavailableException("queue full");
    }
    return { accepted: cmd.id, sensor: this.sensor.getLatest() };
  }
}
