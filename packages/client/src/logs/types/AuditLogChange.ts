import { z } from "zod";

export const auditLogChangeSchema = z.object({
  /** New value of the key */
  newValue: z.unknown().nullish(),
  /** Old value of the key */
  oldValue: z.unknown().nullish(),
  /** Name of the changed entity, with a few exceptions */
  key: z.string()
});

export type AuditLogChange = z.infer<typeof auditLogChangeSchema>;
