import { Injectable, Logger } from "@nestjs/common";
import { SensorRepository } from "./sensor.repository";
import { SensorSnapshot } from "./sensor.schema";

@Injectable()
export class SensorService {
  private readonly logger = new Logger(SensorService.name);
  private latest: SensorSnapshot | null = null;

  constructor(private readonly repository: SensorRepository) {}

  setLatest(snapshot: SensorSnapshot): void {
    this.latest = snapshot;
    void this.persist(snapshot);
  }

  getLatest(): SensorSnapshot | null {
    return this.latest;
  }

  private async persist(snapshot: SensorSnapshot): Promise<void> {
    try {
      await this.repository.save(snapshot);
    } catch (error) {
      this.logger.error("Failed to persist sensor snapshot", error);
    }
  }
}
