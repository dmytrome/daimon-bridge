import { Module } from "@nestjs/common";
import { DrizzleSensorRepository } from "./drizzle-sensor.repository";
import { SensorController } from "./sensor.controller";
import { SensorRepository } from "./sensor.repository";
import { SensorService } from "./sensor.service";

@Module({
  controllers: [SensorController],
  providers: [
    SensorService,
    { provide: SensorRepository, useClass: DrizzleSensorRepository },
  ],
  exports: [SensorService],
})
export class SensorModule {}
