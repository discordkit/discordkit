import * as v from "valibot";
import { asDigits } from "@discordkit/core/validations/asDigits";
import { asInteger } from "@discordkit/core/validations/asInteger";
import { boundedInteger } from "@discordkit/core/validations/boundedInteger";
import { boundedString } from "@discordkit/core/validations/boundedString";
import { schema } from "@discordkit/core/validations/schema";
import { snowflake } from "@discordkit/core/validations/snowflake";
import { roleTagSchema } from "./RoleTag.js";
import { permissionFlag } from "./Permissions.js";
import { roleFlag } from "./RoleFlags.js";
import { roleColorsSchema } from "./RoleColors.js";

const _roleSchema = v.object({
  /** role id */
  id: snowflake,
  /** role name */
  name: boundedString(),
  /**
   * Integer representation of hexadecimal color code.
   *
   * @deprecated The API still returns this field, but `colors` is the
   * preferred source of truth — `color` only carries the primary value.
   */
  color: boundedInteger(),
  /** the role's colors */
  colors: roleColorsSchema,
  /** if this role is pinned in the user listing */
  hoist: v.boolean(),
  /** role icon hash */
  icon: v.nullish(boundedString()),
  /** role unicode emoji */
  unicodeEmoji: v.nullish(boundedString()),
  /** position of this role (roles with the same position are sorted by id) */
  position: boundedInteger(),
  /** permission bit set */
  permissions: asDigits(permissionFlag),
  /** whether this role is managed by an integration */
  managed: v.boolean(),
  /** whether this role is mentionable */
  mentionable: v.boolean(),
  /** the tags this role has */
  tags: v.exactOptional(v.array(roleTagSchema)),
  /** role flags combined as a bitfield */
  flags: asInteger(roleFlag)
});

export interface Role extends v.InferOutput<typeof _roleSchema> {}

/**
 * ### [Role](https://discord.com/developers/docs/topics/permissions#role-object)
 *
 * Roles represent a set of permissions attached to a group of users. Roles have names, colors, and can be "pinned" to the side bar, causing their members to be listed separately. Roles can have separate permission profiles for the global context (guild) and channel context. The `@everyone` role has the same ID as the guild it belongs to.
 */
export const roleSchema = schema<Role>(_roleSchema);
