import {
  object,
  string,
  nonEmpty,
  number,
  integer,
  boolean,
  array,
  type InferOutput,
  pipe,
  nullish,
  exactOptional
} from "valibot";
import { snowflake, asDigits, asInteger } from "@discordkit/core";
import { roleTagSchema } from "./RoleTag.js";
import { permissionFlag } from "./Permissions.js";
import { roleFlag } from "./RoleFlags.js";

/**
 * Roles represent a set of permissions attached to a group of users. Roles have names, colors, and can be "pinned" to the side bar, causing their members to be listed separately. Roles can have separate permission profiles for the global context (guild) and channel context. The `@everyone` role has the same ID as the guild it belongs to.
 */
export const roleSchema = object({
  /** role id */
  id: snowflake,
  /** role name */
  name: pipe(string(), nonEmpty()),
  /** integer representation of hexadecimal color code */
  color: pipe(number(), integer()),
  /** if this role is pinned in the user listing */
  hoist: boolean(),
  /** role icon hash */
  icon: nullish(pipe(string(), nonEmpty())),
  /** role unicode emoji */
  unicodeEmoji: nullish(pipe(string(), nonEmpty())),
  /** position of this role */
  position: pipe(number(), integer()),
  /** permission bit set */
  permissions: asDigits(permissionFlag),
  /** whether this role is managed by an integration */
  managed: boolean(),
  /** whether this role is mentionable */
  mentionable: boolean(),
  /** the tags this role has */
  tags: exactOptional(array(roleTagSchema)),
  /** role flags combined as a bitfield */
  flags: asInteger(roleFlag)
});

export type Role = InferOutput<typeof roleSchema>;
