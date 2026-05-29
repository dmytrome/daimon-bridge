import { Module } from "@nestjs/common";
import { OutputModule } from "../output/output.module";
import { FaceController } from "./face.controller";

@Module({
  imports: [OutputModule],
  controllers: [FaceController],
})
export class FaceModule {}
