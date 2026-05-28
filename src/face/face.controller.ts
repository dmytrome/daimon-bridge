import {
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CommandQueueService } from "../command/command-queue.service";
import { SensorService } from "../sensor/sensor.service";
import { SensorSnapshot } from "../sensor/sensor.schema";
import { FaceDto } from "./face.schema";

@Controller("face")
export class FaceController {
  constructor(
    private readonly queue: CommandQueueService,
    private readonly sensor: SensorService,
  ) {}

  @Post()
  create(
    @Body() body: FaceDto,
  ): { accepted: string; sensor: SensorSnapshot | null } {
    const cmd = this.queue.enqueue("face", body);
    if (cmd === null) {
      throw new ServiceUnavailableException("queue full");
    }
    return { accepted: cmd.id, sensor: this.sensor.getLatest() };
  }
}
