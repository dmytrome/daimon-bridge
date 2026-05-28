import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const MAX_HAPTIC_MS = 5000;

export const HapticBodySchema = z.object({
  pattern: z.enum(["single", "double", "long"]),
  intensity: z.number().min(0).max(1),
  durationMs: z.number().int().positive().max(MAX_HAPTIC_MS),
});

export class HapticDto extends createZodDto(HapticBodySchema) {}
