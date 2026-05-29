import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DRIZZLE, DrizzleDb } from "../database/drizzle";
import { SensorSnapshot } from "../sensor/sensor.schema";
import { AgentPublisher } from "./agent-publisher";

const SENSOR_EVENTS_QUEUE = "sensor_events";

@Injectable()
export class PgmqAgentPublisher extends AgentPublisher {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {
    super();
  }

  async publishSensor(snapshot: SensorSnapshot): Promise<void> {
    await this.db.execute(
      sql`select pgmq.send(${SENSOR_EVENTS_QUEUE}, ${JSON.stringify(snapshot)}::jsonb)`,
    );
  }
}
