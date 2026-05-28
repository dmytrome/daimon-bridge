import { Injectable } from "@nestjs/common";
import { SensorSnapshot } from "./sensor.schema";

@Injectable()
export class SensorService {
  private latest: SensorSnapshot | null = null;

  setLatest(snapshot: SensorSnapshot): void {
    this.latest = snapshot;
  }

  getLatest(): SensorSnapshot | null {
    return this.latest;
  }
}
