import { z } from "zod";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { clientStatusSchema } from "./ClientStatus.js";
import { activitySchema } from "./Activity.js";

export const presenceSchema = z.object({
  /** the user presence is being updated for */
  user: userSchema,
  /** id of the guild */
  guildId: snowflake,
  /** either "idle", "dnd", "online", or "offline" */
  status: z.union([
    z.literal(`idle`),
    z.literal(`dnd`),
    z.literal(`online`),
    z.literal(`offline`)
  ]),
  /** user's current activities */
  activities: activitySchema.array(),
  /** user's platform-dependent status */
  clientStatus: clientStatusSchema
});

export type Presence = z.infer<typeof presenceSchema>;
