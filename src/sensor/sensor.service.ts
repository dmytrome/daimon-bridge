import { Injectable, Logger } from "@nestjs/common";
import { AgentPublisher } from "../agent/agent-publisher";
import { SensorRepository } from "./sensor.repository";
import { SensorSnapshot } from "./sensor.schema";

@Injectable()
export class SensorService {
  private readonly logger = new Logger(SensorService.name);
  private latest: SensorSnapshot | null = null;

  constructor(
    private readonly repository: SensorRepository,
    private readonly publisher: AgentPublisher,
  ) {}

  setLatest(snapshot: SensorSnapshot): void {
    this.latest = snapshot;
    this.runBackground("persist sensor snapshot", () =>
      this.repository.save(snapshot),
    );
    this.runBackground("forward sensor snapshot to agent", () =>
      this.publisher.publishSensor(snapshot),
    );
  }

  getLatest(): SensorSnapshot | null {
    return this.latest;
  }

  private runBackground(label: string, task: () => Promise<void>): void {
    task().catch((error) => this.logger.error(`Failed to ${label}`, error));
  }
}
