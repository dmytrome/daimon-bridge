import { Body, Controller, Post } from "@nestjs/common";
import { OutputResult, OutputService } from "../output/output.service";
import { HapticDto } from "./haptic.schema";

@Controller("haptic")
export class HapticController {
  constructor(private readonly output: OutputService) {}

  @Post()
  create(@Body() body: HapticDto): OutputResult {
    return this.output.dispatch("haptic", body);
  }
}
