import {
  object,
  string,
  minLength,
  number,
  boolean,
  optional,
  array,
  type Output
} from "valibot";
import { snowflake } from "@discordkit/core";
import { roleTagSchema } from "./RoleTag.js";

export const roleSchema = object({
  /** role id */
  id: snowflake,
  /** role name */
  name: string([minLength(1)]),
  /** integer representation of hexadecimal color code */
  color: number(),
  /** if this role is pinned in the user listing */
  hoist: boolean(),
  /** role icon hash */
  icon: optional(string([minLength(1)])),
  /** role unicode emoji */
  unicodeEmoji: optional(string([minLength(1)])),
  /** position of this role */
  position: number(),
  /** permission bit set */
  permissions: string([minLength(1)]),
  /** whether this role is managed by an integration */
  managed: boolean(),
  /** whether this role is mentionable */
  mentionable: boolean(),
  /** the tags this role has */
  tags: optional(array(roleTagSchema))
});

export type Role = Output<typeof roleSchema>;
