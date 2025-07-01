import * as v from "valibot";
import { snowflake, asDigits, asInteger } from "@discordkit/core";
import { roleTagSchema } from "./RoleTag.js";
import { permissionFlag } from "./Permissions.js";
import { roleFlag } from "./RoleFlags.js";

/**
 * Roles represent a set of permissions attached to a group of users. Roles have names, colors, and can be "pinned" to the side bar, causing their members to be listed separately. Roles can have separate permission profiles for the global context (guild) and channel context. The `@everyone` role has the same ID as the guild it belongs to.
 */
export const roleSchema = v.object({
  /** role id */
  id: snowflake,
  /** role name */
  name: v.pipe(v.string(), v.nonEmpty()),
  /** integer representation of hexadecimal color code */
  color: v.pipe(v.number(), v.integer()),
  /** if this role is pinned in the user listing */
  hoist: v.boolean(),
  /** role icon hash */
  icon: v.nullish(v.pipe(v.string(), v.nonEmpty())),
  /** role unicode emoji */
  unicodeEmoji: v.nullish(v.pipe(v.string(), v.nonEmpty())),
  /** position of this role */
  position: v.pipe(v.number(), v.integer()),
  /** permission bit set */
  permissions: asDigits(permissionFlag) as v.GenericSchema<string>,
  /** whether this role is managed by an integration */
  managed: v.boolean(),
  /** whether this role is mentionable */
  mentionable: v.boolean(),
  /** the tags this role has */
  tags: v.exactOptional(v.array(roleTagSchema)),
  /** role flags combined as a bitfield */
  flags: asInteger(roleFlag) as v.GenericSchema<number>
});

export interface Role extends v.InferOutput<typeof roleSchema> {}
