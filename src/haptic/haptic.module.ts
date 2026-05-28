import { Module } from "@nestjs/common";
import { SensorModule } from "../sensor/sensor.module";
import { HapticController } from "./haptic.controller";
import { CommandModule } from "../command/command.module";

@Module({
  imports: [CommandModule, SensorModule],
  controllers: [HapticController],
})
export class HapticModule {}
