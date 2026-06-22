import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { ApplicationId } from "../snowflake.js";

/**
 * Bindings + builder for `discordpp::AuthorizationArgs` (`Discord_AuthorizationArgs_*`) — the input object to `Client::Authorize`. Built transiently inside the authorize flow, attached by value, then dropped; returned as a {@link SubObjectHandle} for `using` cleanup (the read-handle/transient-handle convention shared with presence's sub-objects).
 *
 * Note: `SetCodeChallenge` takes a `Discord_AuthorizationCodeChallenge*` (a pointer to the challenge handle), declared `void *` and passed the challenge handle pointer.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_AuthorizationArgs_Init(void *self)`,
  drop: /* C */ `void Discord_AuthorizationArgs_Drop(void *self)`,
  setClientId: /* C */ `void Discord_AuthorizationArgs_SetClientId(void *self, uint64_t value)`,
  setScopes: /* C */ `void Discord_AuthorizationArgs_SetScopes(void *self, Discord_String value)`,
  setCodeChallenge: /* C */ `void Discord_AuthorizationArgs_SetCodeChallenge(void *self, void *value)`
});

/**
 * Build an initialized `AuthorizationArgs` handle from the resolved client id, scope string, and PKCE challenge handle. Returns a {@link SubObjectHandle}: the caller passes `.handle` to `Discord_Client_Authorize`, then `using` drops it once the SDK has copied it.
 */
export const buildAuthorizationArgs = (
  lib: FfiLibrary,
  args: { clientId: ApplicationId; scopes: string; challenge: FfiOpaque }
): SubObjectHandle => {
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  b.setClientId(handle, BigInt(args.clientId));
  b.setScopes(handle, lib.encodeString(args.scopes));
  b.setCodeChallenge(handle, args.challenge);
  return subObjectHandle(handle, () => b.drop(handle));
};
