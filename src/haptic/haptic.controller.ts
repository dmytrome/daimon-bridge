import {
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CommandQueueService } from "../command/command-queue.service";
import { SensorService } from "../sensor/sensor.service";
import { SensorSnapshot } from "../sensor/sensor.schema";
import { HapticDto } from "./haptic.schema";

@Controller("haptic")
export class HapticController {
  constructor(
    private readonly queue: CommandQueueService,
    private readonly sensor: SensorService,
  ) {}

  @Post()
  create(
    @Body() body: HapticDto,
  ): { accepted: string; sensor: SensorSnapshot | null } {
    const cmd = this.queue.enqueue("haptic", body);
    if (cmd === null) {
      throw new ServiceUnavailableException("queue full");
    }
    return { accepted: cmd.id, sensor: this.sensor.getLatest() };
  }
}
