import { Module } from "@nestjs/common";
import { CommandModule } from "../command/command.module";
import { SensorModule } from "../sensor/sensor.module";
import { OutputService } from "./output.service";

@Module({
  imports: [CommandModule, SensorModule],
  providers: [OutputService],
  exports: [OutputService],
})
export class OutputModule {}
