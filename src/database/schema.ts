import { boolean, doublePrecision, pgTable, timestamp } from "drizzle-orm/pg-core";

export const sensorSnapshots = pgTable("sensor_snapshots", {
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  temperature: doublePrecision("temperature").notNull(),
  motion: boolean("motion").notNull(),
});
