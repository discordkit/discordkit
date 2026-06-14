import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import type { LinkedChannel } from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::LinkedChannel` — the Discord channel a lobby is linked to. A read-only value, so it follows the read-handle→snapshot convention (read once into a plain {@link LinkedChannel}). Its `Name` getter is NOT bool-gated (always present once the struct is valid), so the read is a straight field copy.
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_LinkedChannel_Id(void *self)`,
  guildId: /* C */ `uint64_t Discord_LinkedChannel_GuildId(void *self)`,
  name: /* C */ `void Discord_LinkedChannel_Name(void *self, Discord_String *returnValue)`
});

/** Read a native `LinkedChannel` handle into a plain {@link LinkedChannel} snapshot. */
export const readLinkedChannel = (
  lib: FfiLibrary,
  handle: FfiOpaque
): LinkedChannel => {
  const b = bindings(lib);
  const nameOut = lib.allocStringOut();
  b.name(handle, nameOut);
  return {
    id: b.id(handle) as bigint,
    name: lib.decodeString(nameOut),
    guildId: b.guildId(handle) as bigint
  };
};
