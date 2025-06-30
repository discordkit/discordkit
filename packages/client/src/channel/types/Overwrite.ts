import { asDigits, snowflake } from "@discordkit/core";
import { object, union, literal, type InferOutput } from "valibot";
import { permissionFlag } from "../../permissions/Permissions.js";

export const overwriteSchema = object({
  /** role or user id */
  id: snowflake,
  /** either 0 (role) or 1 (member) */
  type: union([literal(0), literal(1)]),
  /** permission bit set */
  allow: asDigits(permissionFlag),
  /** permission bit set */
  deny: asDigits(permissionFlag)
});

export type Overwrite = InferOutput<typeof overwriteSchema>;
