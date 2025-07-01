import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { clientStatusSchema } from "./ClientStatus.js";
import { activitySchema } from "./Activity.js";

export const presenceSchema = v.object({
  /** the user presence is being updated for */
  user: userSchema,
  /** id of the guild */
  guildId: snowflake,
  /** either "idle", "dnd", "online", or "offline" */
  status: v.union([
    v.literal(`idle`),
    v.literal(`dnd`),
    v.literal(`online`),
    v.literal(`offline`)
  ]),
  /** user's current activities */
  activities: v.array(activitySchema),
  /** user's platform-dependent status */
  clientStatus: clientStatusSchema
});

export interface Presence extends v.InferOutput<typeof presenceSchema> {}
