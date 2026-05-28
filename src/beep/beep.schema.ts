import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const MIN_BEEP_HZ = 100;
export const MAX_BEEP_HZ = 5000;
export const MAX_BEEP_MS = 3000;

export const BeepBodySchema = z.object({
  frequencyHz: z.number().int().min(MIN_BEEP_HZ).max(MAX_BEEP_HZ),
  durationMs: z.number().int().positive().max(MAX_BEEP_MS),
});

export class BeepDto extends createZodDto(BeepBodySchema) {}
