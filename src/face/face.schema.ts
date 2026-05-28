import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const MAX_FACE_MS = 10000;

export const FaceBodySchema = z.object({
  expression: z.enum(["neutral", "happy", "sad", "angry", "surprised"]),
  durationMs: z.number().int().positive().max(MAX_FACE_MS),
});

export class FaceDto extends createZodDto(FaceBodySchema) {}
