import { Body, Controller, Post } from "@nestjs/common";
import { OutputResult, OutputService } from "../output/output.service";
import { FaceDto } from "./face.schema";

@Controller("face")
export class FaceController {
  constructor(private readonly output: OutputService) {}

  @Post()
  create(@Body() body: FaceDto): OutputResult {
    return this.output.dispatch("face", body);
  }
}
