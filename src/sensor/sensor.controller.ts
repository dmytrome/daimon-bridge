import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  SensorSnapshot,
  SensorSnapshotDto,
} from "./sensor.schema";
import { SensorService } from "./sensor.service";

@Controller("sensor")
export class SensorController {
  constructor(private readonly sensor: SensorService) {}

  @Get("now")
  getNow(): SensorSnapshot | null {
    return this.sensor.getLatest();
  }

  @Post("update")
  update(@Body() body: SensorSnapshotDto): SensorSnapshot {
    this.sensor.setLatest(body);
    return body;
  }
}
