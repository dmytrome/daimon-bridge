import { Module } from "@nestjs/common";
import { SensorModule } from "../sensor/sensor.module";
import { BeepController } from "./beep.controller";
import { CommandModule } from "../command/command.module";

@Module({
  imports: [CommandModule, SensorModule],
  controllers: [BeepController],
})
export class BeepModule {}
