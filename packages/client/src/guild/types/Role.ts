import {
  object,
  string,
  nonEmpty,
  number,
  boolean,
  optional,
  array,
  type InferOutput,
  pipe
} from "valibot";
import { snowflake } from "@discordkit/core";
import { roleTagSchema } from "./RoleTag.js";

export const roleSchema = object({
  /** role id */
  id: snowflake,
  /** role name */
  name: pipe(string(), nonEmpty()),
  /** integer representation of hexadecimal color code */
  color: number(),
  /** if this role is pinned in the user listing */
  hoist: boolean(),
  /** role icon hash */
  icon: optional(pipe(string(), nonEmpty())),
  /** role unicode emoji */
  unicodeEmoji: optional(pipe(string(), nonEmpty())),
  /** position of this role */
  position: number(),
  /** permission bit set */
  permissions: pipe(string(), nonEmpty()),
  /** whether this role is managed by an integration */
  managed: boolean(),
  /** whether this role is mentionable */
  mentionable: boolean(),
  /** the tags this role has */
  tags: optional(array(roleTagSchema))
});

export type Role = InferOutput<typeof roleSchema>;
