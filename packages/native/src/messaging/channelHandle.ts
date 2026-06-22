import { defineBindings } from "../ffi/bindings.js";
import { readString } from "../ffi/readers.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import {
  brandId,
  brandIds,
  type ChannelId,
  type UserId
} from "../snowflake.js";
import { CHANNEL_TYPE_BY_CODE, type Channel } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::ChannelHandle`. Read-only value → plain {@link Channel} snapshot. `Recipients` is a `Discord_UInt64Span` (the scalar-id list primitive); `Name` is a non-gated string.
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_ChannelHandle_Id(void *self)`,
  type: /* C */ `int Discord_ChannelHandle_Type(void *self)`,
  name: /* C */ `void Discord_ChannelHandle_Name(void *self, Discord_String *returnValue)`,
  recipients: /* C */ `void Discord_ChannelHandle_Recipients(void *self, Discord_Span *returnValue)`
});

/** Read a native `ChannelHandle` into a plain {@link Channel} snapshot. */
export const readChannel = (lib: FfiLibrary, handle: FfiOpaque): Channel => {
  const b = bindings(lib);
  const recipients = lib.allocSpanOut();
  b.recipients(handle, recipients);
  return {
    id: brandId<ChannelId>(b.id(handle)),
    name: readString(lib, handle, b.name),
    type: CHANNEL_TYPE_BY_CODE[Number(b.type(handle))] ?? `unknown`,
    recipientIds: brandIds<UserId>(lib.readUInt64Span(recipients))
  };
};
