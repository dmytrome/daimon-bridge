import { Controller, Get, Query } from "@nestjs/common";
import { CommandQueueService } from "./command-queue.service";
import { Command, PollQueryDto } from "./command.schema";

@Controller("command")
export class CommandController {
  constructor(private readonly queue: CommandQueueService) {}

  @Get("poll")
  poll(@Query() query: PollQueryDto): { command: Command | null } {
    return { command: this.queue.dequeue(query.channel) };
  }
}
