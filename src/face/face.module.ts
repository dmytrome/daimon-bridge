import { Module } from "@nestjs/common";
import { SensorModule } from "../sensor/sensor.module";
import { FaceController } from "./face.controller";
import { CommandModule } from "../command/command.module";

@Module({
  imports: [CommandModule, SensorModule],
  controllers: [FaceController],
})
export class FaceModule {}
