import { defineBindings } from "../ffi/bindings.js";
import { readGatedString } from "../ffi/readers.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { UserId } from "../snowflake.js";
import { STATUS_TYPE_BY_CODE, type User } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::UserHandle` (`Discord_UserHandle_*`).
 *
 * Per the read-handle convention, a `UserHandle` is read ONCE into a plain {@link User} snapshot rather than wrapped in a live class — it's read-only data, so a plain object is simpler and needs no disposal. {@link readUser} is the template the other read-handle domains (relationships, lobby members, …) follow.
 *
 * The C getters use two shapes: scalars (`Id`→uint64, `Status`→enum int, `IsProvisional`→bool) return directly; strings write into a `Discord_String*` out-param and return a `bool` for "is the value present" — so optional fields (`Avatar`, `GlobalName`) are read only when that bool is true.
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_UserHandle_Id(void *self)`,
  status: /* C */ `int Discord_UserHandle_Status(void *self)`,
  isProvisional: /* C */ `bool Discord_UserHandle_IsProvisional(void *self)`,
  username: /* C */ `bool Discord_UserHandle_Username(void *self, Discord_String *returnValue)`,
  displayName: /* C */ `bool Discord_UserHandle_DisplayName(void *self, Discord_String *returnValue)`,
  globalName: /* C */ `bool Discord_UserHandle_GlobalName(void *self, Discord_String *returnValue)`,
  avatar: /* C */ `bool Discord_UserHandle_Avatar(void *self, Discord_String *returnValue)`
});

/**
 * Read a native `UserHandle` into a plain {@link User} snapshot. The handle is not retained — every field is copied out now. A handle whose `Id()` is `0n` is no longer valid; callers that fetch a user should check validity before reading (see `getUser`).
 *
 * `username`/`displayName` are bool-gated like the optional strings, but the bool there is success (not optionality), so they fall back to `""`; `globalName`/`avatar` are genuinely optional and stay `undefined` when absent.
 */
export const readUser = (lib: FfiLibrary, handle: FfiOpaque): User => {
  const b = bindings(lib);
  const gated = (getter: (self: FfiOpaque, out: FfiOpaque) => unknown) =>
    readGatedString(lib, handle, getter);

  return {
    id: b.id(handle) as UserId,
    username: gated(b.username) ?? ``,
    displayName: gated(b.displayName) ?? ``,
    globalName: gated(b.globalName),
    avatar: gated(b.avatar),
    status: STATUS_TYPE_BY_CODE[Number(b.status(handle))] ?? `unknown`,
    provisional: Boolean(b.isProvisional(handle))
  };
};
