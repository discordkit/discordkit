import * as v from "valibot";
import { asDigits, snowflake, schema } from "@discordkit/core";
import { permissionFlag } from "../../permissions/Permissions.js";

const _overwriteSchema = v.object({
  /** role or user id */
  id: snowflake,
  /** either 0 (role) or 1 (member) */
  type: v.picklist([0, 1]),
  /** permission bit set */
  allow: asDigits(permissionFlag),
  /** permission bit set */
  deny: asDigits(permissionFlag)
});

export interface Overwrite extends v.InferOutput<typeof _overwriteSchema> {}

/**
 * ### [Overwrite](https://discord.com/developers/docs/resources/channel#overwrite-object)
 *
 * See permissions for more information about the `allow` and `deny` fields.
 */
export const overwriteSchema = schema<Overwrite>(_overwriteSchema);
