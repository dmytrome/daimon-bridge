import { Module } from "@nestjs/common";
import { OutputModule } from "../output/output.module";
import { BeepController } from "./beep.controller";

@Module({
  imports: [OutputModule],
  controllers: [BeepController],
})
export class BeepModule {}
