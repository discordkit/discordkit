import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import { readUser } from "../users/userHandle.js";
import type { LobbyMember } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::LobbyMemberHandle`. A member is read-only data, so it follows the read-handle→snapshot convention (unlike the lobby itself, which is a live wrapper).
 *
 * Cross-domain by design: a member embeds the target {@link readUser | User}, so this imports the users domain's reader — the same legitimate read dependency relationships has. Member metadata is read via the seam's {@link FfiLibrary.readProperties} (`Discord_Properties` → plain object).
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_LobbyMemberHandle_Id(void *self)`,
  connected: /* C */ `bool Discord_LobbyMemberHandle_Connected(void *self)`,
  canLinkLobby: /* C */ `bool Discord_LobbyMemberHandle_CanLinkLobby(void *self)`,
  metadata: /* C */ `void Discord_LobbyMemberHandle_Metadata(void *self, Discord_Properties *returnValue)`,
  user: /* C */ `bool Discord_LobbyMemberHandle_User(void *self, Discord_UserHandle *returnValue)`
});

/** Read a native `LobbyMemberHandle` into a plain {@link LobbyMember} snapshot. */
export const readLobbyMember = (
  lib: FfiLibrary,
  handle: FfiOpaque
): LobbyMember => {
  const b = bindings(lib);

  const metaOut = lib.allocPropertiesOut();
  b.metadata(handle, metaOut);

  // The member's user, when the SDK has the handle (bool-gated out-param).
  const userOut = lib.allocHandle();
  const user = b.user(handle, userOut) ? readUser(lib, userOut) : undefined;

  return {
    id: b.id(handle) as bigint,
    connected: Boolean(b.connected(handle)),
    canLinkLobby: Boolean(b.canLinkLobby(handle)),
    metadata: lib.readProperties(metaOut),
    ...(user ? { user } : {})
  };
};
