import { object, unknown, nullish, string, type InferOutput } from "valibot";

export const auditLogChangeSchema = object({
  /** New value of the key */
  newValue: nullish(unknown()),
  /** Old value of the key */
  oldValue: nullish(unknown()),
  /** Name of the changed entity, with a few exceptions */
  key: string()
});

export type AuditLogChange = InferOutput<typeof auditLogChangeSchema>;
