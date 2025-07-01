import {
  object,
  unknown,
  string,
  type InferOutput,
  exactOptional,
  pipe,
  nonEmpty
} from "valibot";

export const auditLogChangeSchema = object({
  /** New value of the key */
  newValue: exactOptional(unknown()),
  /** Old value of the key */
  oldValue: exactOptional(unknown()),
  /** Name of the changed entity, with a few exceptions */
  key: pipe(string(), nonEmpty())
});

export interface AuditLogChange
  extends InferOutput<typeof auditLogChangeSchema> {}
