import { SensorSnapshot } from "../sensor/sensor.schema";

export abstract class AgentPublisher {
  abstract publishSensor(snapshot: SensorSnapshot): Promise<void>;
}
