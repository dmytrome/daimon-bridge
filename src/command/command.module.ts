import { Module } from "@nestjs/common";
import { CommandController } from "./command.controller";
import { CommandQueueService } from "./command-queue.service";

@Module({
  controllers: [CommandController],
  providers: [CommandQueueService],
  exports: [CommandQueueService],
})
export class CommandModule {}
