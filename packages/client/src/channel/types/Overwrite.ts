import * as v from "valibot";
import { asDigits, snowflake } from "@discordkit/core";
import { permissionFlag } from "../../permissions/Permissions.js";

export const overwriteSchema = v.object({
  /** role or user id */
  id: snowflake,
  /** either 0 (role) or 1 (member) */
  type: v.picklist([0, 1]),
  /** permission bit set */
  allow: asDigits(permissionFlag),
  /** permission bit set */
  deny: asDigits(permissionFlag)
});

export interface Overwrite extends v.InferOutput<typeof overwriteSchema> {}
