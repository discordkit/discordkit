import { asDigits, snowflake } from "@discordkit/core";
import {
  object,
  union,
  literal,
  type InferOutput,
  type GenericSchema
} from "valibot";
import { permissionFlag } from "../../permissions/Permissions.js";

export const overwriteSchema = object({
  /** role or user id */
  id: snowflake as GenericSchema<string>,
  /** either 0 (role) or 1 (member) */
  type: union([literal(0), literal(1)]),
  /** permission bit set */
  allow: asDigits(permissionFlag) as GenericSchema<string>,
  /** permission bit set */
  deny: asDigits(permissionFlag) as GenericSchema<string>
});

export interface Overwrite extends InferOutput<typeof overwriteSchema> {}
