import { z } from "zod";

export enum ScheduledEventEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3
}

export const scheduledEventEntityTypeSchema = z.nativeEnum(
  ScheduledEventEntityType
);
