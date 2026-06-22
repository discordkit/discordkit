import type { FfiLibrary, FfiOpaque } from "./backend.js";

/**
 * Shared field readers for the read-handle snapshot convention. The SDK's string
 * getters come in two shapes; these capture the (otherwise verbatim) `allocate
 * out-param → call → decode` boilerplate so each reader module states only its
 * fields, not the marshaling.
 */

/**
 * Read a NON-gated string getter (`void getter(self, Discord_String* out)`) — the
 * value is always present once the handle is valid (e.g. `ChannelHandle::Name`,
 * `LinkedChannel::Name`). Returns the decoded string (may be empty).
 */
export const readString = (
  lib: FfiLibrary,
  handle: FfiOpaque,
  getter: (self: FfiOpaque, out: FfiOpaque) => unknown
): string => {
  const out = lib.allocStringOut();
  getter(handle, out);
  return lib.decodeString(out);
};

/**
 * Read a BOOL-GATED optional string getter (`bool getter(self, Discord_String*
 * out)`) — the bool reports whether the value is present (e.g. `UserHandle::
 * Avatar`, `AdditionalContent::Title`). Returns the decoded string, or
 * `undefined` when absent.
 */
export const readGatedString = (
  lib: FfiLibrary,
  handle: FfiOpaque,
  getter: (self: FfiOpaque, out: FfiOpaque) => unknown
): string | undefined => {
  const out = lib.allocStringOut();
  return getter(handle, out) ? lib.decodeString(out) : undefined;
};

/**
 * Read a `Discord_Properties` metadata getter (`void getter(self, Discord_
 * Properties* out)`) into a plain string→string object (e.g. `LobbyHandle::
 * Metadata`, `MessageHandle::ModerationMetadata`).
 */
export const readPropertiesOf = (
  lib: FfiLibrary,
  handle: FfiOpaque,
  getter: (self: FfiOpaque, out: FfiOpaque) => unknown
): Record<string, string> => {
  const out = lib.allocPropertiesOut();
  getter(handle, out);
  return lib.readProperties(out);
};
