import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE, DrizzleDb } from "../database/drizzle";
import { sensorSnapshots } from "../database/schema";
import { SensorRepository } from "./sensor.repository";
import { SensorSnapshot } from "./sensor.schema";

@Injectable()
export class DrizzleSensorRepository extends SensorRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {
    super();
  }

  async save(snapshot: SensorSnapshot): Promise<void> {
    await this.db.insert(sensorSnapshots).values({
      capturedAt: new Date(snapshot.capturedAt),
      temperature: snapshot.temperature,
      motion: snapshot.motion,
    });
  }
}
