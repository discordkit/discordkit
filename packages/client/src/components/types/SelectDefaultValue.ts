import * as v from "valibot";
import { snowflake } from "@discordkit/core";

export const selectDefaultValueSchema = v.object({
  /** ID of a user, role, or channel */
  id: snowflake,
  /** Type of value that id represents. Either "user", "role", or "channel" */
  type: v.union([v.literal(`user`), v.literal(`role`), v.literal(`channel`)])
});

export interface SelectDefaultValue
  extends v.InferOutput<typeof selectDefaultValueSchema> {}
