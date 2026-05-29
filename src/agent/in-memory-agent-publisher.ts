import { SensorSnapshot } from "../sensor/sensor.schema";
import { AgentPublisher } from "./agent-publisher";

export class InMemoryAgentPublisher extends AgentPublisher {
  readonly published: SensorSnapshot[] = [];

  async publishSensor(snapshot: SensorSnapshot): Promise<void> {
    this.published.push(snapshot);
  }
}
