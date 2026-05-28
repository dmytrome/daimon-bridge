import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ChannelSchema = z.enum(["haptic", "face", "beep"]);
export type Channel = z.infer<typeof ChannelSchema>;

export interface Command {
  id: string;
  channel: Channel;
  payload: unknown;
  createdAt: string;
}

export class PollQueryDto extends createZodDto(
  z.object({ channel: ChannelSchema }),
) {}
