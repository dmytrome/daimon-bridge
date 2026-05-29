import { SensorSnapshot } from "./sensor.schema";

export abstract class SensorRepository {
  abstract save(snapshot: SensorSnapshot): Promise<void>;
}
