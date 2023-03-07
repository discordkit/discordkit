export interface OptionalAuditEntryInfo {
  /** ID of the app whose permissions were targeted */
  applicationId?: string;
  /** Channel in which the entities were targeted */
  channelId?: string;
  /** Number of entities that were targeted */
  count?: string;
  /** Number of days after which inactive members were kicked */
  deleteMemberDays?: string;
  /** ID of the overwritten entity */
  id?: string;
  /** Number of members removed by the prune */
  membersRemoved?: string;
  /** ID of the message that was targeted */
  messageId?: string;
  /** Name of the role if type is "0" (not present if type is "1") */
  roleName?: string;
  /** Type of overwritten entity - role ("0") or member ("1") */
  type?: string;
}
