import * as v from "valibot";

export const auditLogChangeSchema = v.object({
  /** New value of the key */
  newValue: v.exactOptional(v.unknown()),
  /** Old value of the key */
  oldValue: v.exactOptional(v.unknown()),
  /** Name of the changed entity, with a few exceptions */
  key: v.pipe(v.string(), v.nonEmpty())
});

export interface AuditLogChange
  extends v.InferOutput<typeof auditLogChangeSchema> {}
