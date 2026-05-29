import { Module } from "@nestjs/common";
import { AgentPublisher } from "../agent/agent-publisher";
import { PgmqAgentPublisher } from "../agent/pgmq-agent-publisher";
import { DrizzleSensorRepository } from "./drizzle-sensor.repository";
import { SensorController } from "./sensor.controller";
import { SensorRepository } from "./sensor.repository";
import { SensorService } from "./sensor.service";

@Module({
  controllers: [SensorController],
  providers: [
    SensorService,
    { provide: SensorRepository, useClass: DrizzleSensorRepository },
    { provide: AgentPublisher, useClass: PgmqAgentPublisher },
  ],
  exports: [SensorService],
})
export class SensorModule {}
