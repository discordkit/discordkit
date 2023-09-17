import { z } from "zod";
import { user } from "../../user";
import { clientStatus } from "./ClientStatus";
import { activity } from "./Activity";

export const presence = z.object({
  /** the user presence is being updated for */
  user,
  /** id of the guild */
  guildId: z.string(),
  /** either "idle", "dnd", "online", or "offline" */
  status: z.union([
    z.literal(`idle`),
    z.literal(`dnd`),
    z.literal(`online`),
    z.literal(`offline`)
  ]),
  /** user's current activities */
  activities: activity.array(),
  /** user's platform-dependent status */
  clientStatus
});

export type Presence = z.infer<typeof presence>;
