import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import { STATUS_TYPE_BY_CODE, type User } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::UserHandle` (`Discord_UserHandle_*`).
 *
 * Per the read-handle convention, a `UserHandle` is read ONCE into a plain {@link User} snapshot rather than wrapped in a live class — it's read-only data, so a plain object is simpler and needs no disposal. {@link readUser} is the template the other read-handle domains (relationships, lobby members, …) follow.
 *
 * The C getters use two shapes: scalars (`Id`→uint64, `Status`→enum int, `IsProvisional`→bool) return directly; strings write into a `Discord_String*` out-param and return a `bool` for "is the value present" — so optional fields (`Avatar`, `GlobalName`) are read only when that bool is true.
 */
const bindings = defineBindings({
  id: `uint64_t Discord_UserHandle_Id(void *self)`,
  status: `int Discord_UserHandle_Status(void *self)`,
  isProvisional: `bool Discord_UserHandle_IsProvisional(void *self)`,
  username: `bool Discord_UserHandle_Username(void *self, Discord_String *returnValue)`,
  displayName: `bool Discord_UserHandle_DisplayName(void *self, Discord_String *returnValue)`,
  globalName: `bool Discord_UserHandle_GlobalName(void *self, Discord_String *returnValue)`,
  avatar: `bool Discord_UserHandle_Avatar(void *self, Discord_String *returnValue)`
});

/**
 * Read a string off a native handle whose C getter is `bool getter(self, Discord_String* out)` — the bool reports whether the value is present. Returns the decoded string, or `undefined` when absent. The shared shape for every optional-string field on a read handle.
 */
const readOptionalString = (
  lib: FfiLibrary,
  present: unknown,
  out: FfiOpaque
): string | undefined => (present ? lib.decodeString(out) : undefined);

/**
 * Read a native `UserHandle` into a plain {@link User} snapshot. The handle is not retained — every field is copied out now. A handle whose `Id()` is `0n` is no longer valid; callers that fetch a user should check validity before reading (see `getUser`).
 */
export const readUser = (lib: FfiLibrary, handle: FfiOpaque): User => {
  const b = bindings(lib);

  const readString = (
    getter: (self: FfiOpaque, out: FfiOpaque) => unknown
  ): string | undefined => {
    const out = lib.allocStringOut();
    return readOptionalString(lib, getter(handle, out), out);
  };

  return {
    id: b.id(handle) as bigint,
    // Required strings: the bool is success, not optionality — fall back to "".
    username: readString(b.username) ?? ``,
    displayName: readString(b.displayName) ?? ``,
    globalName: readString(b.globalName),
    avatar: readString(b.avatar),
    status: STATUS_TYPE_BY_CODE[Number(b.status(handle))] ?? `unknown`,
    provisional: Boolean(b.isProvisional(handle))
  };
};
