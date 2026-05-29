import { SensorRepository } from "./sensor.repository";
import { SensorSnapshot } from "./sensor.schema";

export class InMemorySensorRepository extends SensorRepository {
  readonly saved: SensorSnapshot[] = [];

  async save(snapshot: SensorSnapshot): Promise<void> {
    this.saved.push(snapshot);
  }
}
