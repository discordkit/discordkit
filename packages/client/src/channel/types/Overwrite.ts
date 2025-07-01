import * as v from "valibot";
import { asDigits, snowflake } from "@discordkit/core";
import { permissionFlag } from "../../permissions/Permissions.js";

export const overwriteSchema = v.object({
  /** role or user id */
  id: snowflake as v.GenericSchema<string>,
  /** either 0 (role) or 1 (member) */
  type: v.union([v.literal(0), v.literal(1)]),
  /** permission bit set */
  allow: asDigits(permissionFlag) as v.GenericSchema<string>,
  /** permission bit set */
  deny: asDigits(permissionFlag) as v.GenericSchema<string>
});

export interface Overwrite extends v.InferOutput<typeof overwriteSchema> {}
