import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { UserId } from "../snowflake.js";
import { readUser } from "../users/userHandle.js";
import { RELATIONSHIP_TYPE_BY_CODE, type Relationship } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::RelationshipHandle`. Follows the read-handle convention established by `readUser`: read once into a plain {@link Relationship} snapshot, no live wrapper.
 *
 * Cross-domain by design: `Relationship` embeds the target {@link readUser | User}, so this module imports the users domain's reader. That's a legitimate read dependency (a relationship contains a user) — distinct from the forbidden "feature op as a client method." The tree-shaking boundary that matters (no presence/auth) still holds.
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_RelationshipHandle_Id(void *self)`,
  discordType: /* C */ `int Discord_RelationshipHandle_DiscordRelationshipType(void *self)`,
  gameType: /* C */ `int Discord_RelationshipHandle_GameRelationshipType(void *self)`,
  isSpamRequest: /* C */ `bool Discord_RelationshipHandle_IsSpamRequest(void *self)`,
  user: /* C */ `bool Discord_RelationshipHandle_User(void *self, void *returnValue)`
});

/** Read a native `RelationshipHandle` into a plain {@link Relationship} snapshot. */
export const readRelationship = (
  lib: FfiLibrary,
  handle: FfiOpaque
): Relationship => {
  const b = bindings(lib);
  const code = (getter: (self: FfiOpaque) => unknown): number =>
    Number(getter(handle));

  // The target user, when the SDK has the handle (bool-gated out-param).
  const userOut = lib.allocHandle();
  const user = b.user(handle, userOut) ? readUser(lib, userOut) : undefined;

  return {
    userId: b.id(handle) as UserId,
    discordType: RELATIONSHIP_TYPE_BY_CODE[code(b.discordType)] ?? `none`,
    gameType: RELATIONSHIP_TYPE_BY_CODE[code(b.gameType)] ?? `none`,
    spamRequest: Boolean(b.isSpamRequest(handle)),
    ...(user ? { user } : {})
  };
};
