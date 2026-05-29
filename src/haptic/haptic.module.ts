import { Module } from "@nestjs/common";
import { OutputModule } from "../output/output.module";
import { HapticController } from "./haptic.controller";

@Module({
  imports: [OutputModule],
  controllers: [HapticController],
})
export class HapticModule {}
