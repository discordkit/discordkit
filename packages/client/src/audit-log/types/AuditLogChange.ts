import * as v from "valibot";
import { boundedString } from "@discordkit/core/validations/boundedString";

/**
 * ### [Audit Log Change](https://discord.com/developers/docs/resources/audit-log#audit-log-change-object)
 *
 * Many {@link AuditLog | audit log} events include a `changes` array in their entry object. The structure for the individual changes varies based on the event type and its changed objects, so apps shouldn't depend on a single pattern of handling {@link AuditLog | audit log} events.
 */
export const auditLogChangeSchema = v.object({
  /** New value of the key */
  newValue: v.exactOptional(v.unknown()),
  /** Old value of the key */
  oldValue: v.exactOptional(v.unknown()),
  /** Name of the changed entity, with a few exceptions */
  key: boundedString()
});

export interface AuditLogChange extends v.InferOutput<
  typeof auditLogChangeSchema
> {}
