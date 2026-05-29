import { Body, Controller, Post } from "@nestjs/common";
import { OutputResult, OutputService } from "../output/output.service";
import { BeepDto } from "./beep.schema";

@Controller("beep")
export class BeepController {
  constructor(private readonly output: OutputService) {}

  @Post()
  create(@Body() body: BeepDto): OutputResult {
    return this.output.dispatch("beep", body);
  }
}
