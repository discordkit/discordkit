import { snowflake } from "@discordkit/core";
import { object, union, literal, type Output } from "valibot";

export const selectDefaultValueSchema = object({
  /** ID of a user, role, or channel */
  id: snowflake,
  /** Type of value that id represents. Either "user", "role", or "channel" */
  type: union([literal(`user`), literal(`role`), literal(`channel`)])
});

export type SelectDefaultValue = Output<typeof selectDefaultValueSchema>;
