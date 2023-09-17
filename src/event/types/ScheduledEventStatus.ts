import { z } from "zod";

export enum ScheduledEventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4
}

export const scheduledEventStatus = z.nativeEnum(ScheduledEventStatus);
