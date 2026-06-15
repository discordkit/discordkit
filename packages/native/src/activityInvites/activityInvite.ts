import { defineBindings, subObjectHandle } from "../ffi/bindings.js";
import type { SubObjectHandle } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type {
  ApplicationId,
  ChannelId,
  MessageId,
  UserId
} from "../snowflake.js";
import {
  ACTIVITY_ACTION_TYPE_BY_CODE,
  ACTIVITY_ACTION_TYPE_CODE,
  type ActivityInvite
} from "./types.js";

/**
 * Bindings + (de)serialization for `discordpp::ActivityInvite`.
 *
 * This handle is read in BOTH directions, which is what makes it unlike the other read-handles (`UserHandle`, `RelationshipHandle`):
 *
 * - **Inbound** ({@link readActivityInvite}): the SDK fills a handle when an invite arrives (via the created/updated callbacks); we read it once into a plain {@link ActivityInvite} snapshot, the read-handle convention.
 * - **Outbound** ({@link buildActivityInvite}): `acceptActivityInvite` / `replyToActivityJoinRequest` take a `Discord_ActivityInvite*`, so a stored snapshot must be marshaled back into a transient native handle. That handle is a {@link SubObjectHandle} (`using`-disposed) — built to hand to one call, then dropped.
 *
 * Its string getters are NOT bool-gated (every field is always present, unlike `UserHandle`'s optional strings), so the inbound read is a straight field copy.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_ActivityInvite_Init(void *self)`,
  drop: /* C */ `void Discord_ActivityInvite_Drop(void *self)`,
  // --- inbound getters ---
  type: /* C */ `int Discord_ActivityInvite_Type(void *self)`,
  senderId: /* C */ `uint64_t Discord_ActivityInvite_SenderId(void *self)`,
  channelId: /* C */ `uint64_t Discord_ActivityInvite_ChannelId(void *self)`,
  messageId: /* C */ `uint64_t Discord_ActivityInvite_MessageId(void *self)`,
  applicationId: /* C */ `uint64_t Discord_ActivityInvite_ApplicationId(void *self)`,
  parentApplicationId: /* C */ `uint64_t Discord_ActivityInvite_ParentApplicationId(void *self)`,
  isValid: /* C */ `bool Discord_ActivityInvite_IsValid(void *self)`,
  partyId: /* C */ `void Discord_ActivityInvite_PartyId(void *self, Discord_String *returnValue)`,
  sessionId: /* C */ `void Discord_ActivityInvite_SessionId(void *self, Discord_String *returnValue)`,
  // --- outbound setters ---
  setType: /* C */ `void Discord_ActivityInvite_SetType(void *self, int value)`,
  setSenderId: /* C */ `void Discord_ActivityInvite_SetSenderId(void *self, uint64_t value)`,
  setChannelId: /* C */ `void Discord_ActivityInvite_SetChannelId(void *self, uint64_t value)`,
  setMessageId: /* C */ `void Discord_ActivityInvite_SetMessageId(void *self, uint64_t value)`,
  setApplicationId: /* C */ `void Discord_ActivityInvite_SetApplicationId(void *self, uint64_t value)`,
  setParentApplicationId: /* C */ `void Discord_ActivityInvite_SetParentApplicationId(void *self, uint64_t value)`,
  setIsValid: /* C */ `void Discord_ActivityInvite_SetIsValid(void *self, bool value)`,
  setPartyId: /* C */ `void Discord_ActivityInvite_SetPartyId(void *self, Discord_String value)`,
  setSessionId: /* C */ `void Discord_ActivityInvite_SetSessionId(void *self, Discord_String value)`
});

/** Read a native `ActivityInvite` handle into a plain {@link ActivityInvite} snapshot. */
export const readActivityInvite = (
  lib: FfiLibrary,
  handle: FfiOpaque
): ActivityInvite => {
  const b = bindings(lib);
  const readString = (
    getter: (self: FfiOpaque, out: FfiOpaque) => unknown
  ): string => {
    const out = lib.allocStringOut();
    getter(handle, out);
    return lib.decodeString(out);
  };

  return {
    type: ACTIVITY_ACTION_TYPE_BY_CODE[Number(b.type(handle))] ?? `invalid`,
    senderId: b.senderId(handle) as UserId,
    channelId: b.channelId(handle) as ChannelId,
    messageId: b.messageId(handle) as MessageId,
    applicationId: b.applicationId(handle) as ApplicationId,
    parentApplicationId: b.parentApplicationId(handle) as ApplicationId,
    partyId: readString(b.partyId),
    sessionId: readString(b.sessionId),
    valid: Boolean(b.isValid(handle))
  };
};

/**
 * Marshal a stored {@link ActivityInvite} snapshot back into a transient native `ActivityInvite` handle, for the ops that take one (`AcceptActivityInvite`, `SendActivityJoinRequestReply`). Returned as a {@link SubObjectHandle} so `using` drops it after the call copies it.
 */
export const buildActivityInvite = (
  lib: FfiLibrary,
  invite: ActivityInvite
): SubObjectHandle => {
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  b.setType(handle, ACTIVITY_ACTION_TYPE_CODE[invite.type]);
  b.setSenderId(handle, invite.senderId);
  b.setChannelId(handle, invite.channelId);
  b.setMessageId(handle, invite.messageId);
  b.setApplicationId(handle, invite.applicationId);
  b.setParentApplicationId(handle, invite.parentApplicationId);
  b.setIsValid(handle, invite.valid);
  b.setPartyId(handle, lib.encodeString(invite.partyId));
  b.setSessionId(handle, lib.encodeString(invite.sessionId));
  return subObjectHandle(handle, () => b.drop(handle));
};
