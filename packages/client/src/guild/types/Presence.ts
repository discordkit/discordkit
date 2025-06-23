import { object, union, literal, array, type InferOutput } from "valibot";
import { snowflake } from "@discordkit/core";
import { userSchema } from "../../user/types/User.js";
import { clientStatusSchema } from "./ClientStatus.js";
import { activitySchema } from "./Activity.js";

export const presenceSchema = object({
  /** the user presence is being updated for */
  user: userSchema,
  /** id of the guild */
  guildId: snowflake,
  /** either "idle", "dnd", "online", or "offline" */
  status: union([
    literal(`idle`),
    literal(`dnd`),
    literal(`online`),
    literal(`offline`)
  ]),
  /** user's current activities */
  activities: array(activitySchema),
  /** user's platform-dependent status */
  clientStatus: clientStatusSchema
});

export type Presence = InferOutput<typeof presenceSchema>;
