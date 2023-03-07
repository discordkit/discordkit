export interface AuditLogChange {
  /** New value of the key */
  newValue?: unknown;
  /** Old value of the key */
  oldValue?: unknown;
  /** Name of the changed entity, with a few exceptions */
  key: string;
}
