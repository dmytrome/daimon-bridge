import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const SENSOR_MAX_SKEW_MS = 5000;

export const SensorSnapshotSchema = z.object({
  capturedAt: z.iso.datetime().refine((value) => {
    const t = Date.parse(value);
    return Math.abs(Date.now() - t) <= SENSOR_MAX_SKEW_MS;
  }, `capturedAt must be within ${SENSOR_MAX_SKEW_MS}ms of server time`),
  temperature: z.number(),
  motion: z.boolean(),
});

export class SensorSnapshotDto extends createZodDto(SensorSnapshotSchema) {}
export type SensorSnapshot = z.infer<typeof SensorSnapshotSchema>;
