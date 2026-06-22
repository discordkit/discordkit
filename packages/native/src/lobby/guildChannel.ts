import { defineBindings } from "../ffi/bindings.js";
import { readString } from "../ffi/readers.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import {
  brandId,
  type ApplicationId,
  type ChannelId,
  type GuildId,
  type LobbyId
} from "../snowflake.js";
import {
  CHANNEL_TYPE_BY_CODE,
  type GuildChannel,
  type Guild
} from "./types.js";

/**
 * Bindings + snapshot readers for the channel-linking discovery types: `discordpp::GuildChannel` (a server channel the user can see, a link candidate), its nested `LinkedLobby`, and `discordpp::GuildMinimal` (a server the user belongs to). All read-only values → plain snapshots.
 *
 * Two less-common out-param shapes appear here: `ParentId` is a bool-gated `uint64_t*` (seam {@link FfiLibrary.allocUInt64Out}/readUInt64Out), and `LinkedLobby` is a bool-gated nested struct read into a sub-snapshot.
 */
const channel = defineBindings({
  id: /* C */ `uint64_t Discord_GuildChannel_Id(void *self)`,
  type: /* C */ `int Discord_GuildChannel_Type(void *self)`,
  position: /* C */ `int32_t Discord_GuildChannel_Position(void *self)`,
  isLinkable: /* C */ `bool Discord_GuildChannel_IsLinkable(void *self)`,
  viewableByAll: /* C */ `bool Discord_GuildChannel_IsViewableAndWriteableByAllMembers(void *self)`,
  name: /* C */ `void Discord_GuildChannel_Name(void *self, Discord_String *returnValue)`,
  parentId: /* C */ `bool Discord_GuildChannel_ParentId(void *self, uint64_t *returnValue)`,
  linkedLobby: /* C */ `bool Discord_GuildChannel_LinkedLobby(void *self, void *returnValue)`,
  linkedLobbyId: /* C */ `uint64_t Discord_LinkedLobby_LobbyId(void *self)`,
  linkedLobbyAppId: /* C */ `uint64_t Discord_LinkedLobby_ApplicationId(void *self)`
});

const guild = defineBindings({
  id: /* C */ `uint64_t Discord_GuildMinimal_Id(void *self)`,
  name: /* C */ `void Discord_GuildMinimal_Name(void *self, Discord_String *returnValue)`
});

/** Read a native `GuildChannel` handle into a plain {@link GuildChannel} snapshot. */
export const readGuildChannel = (
  lib: FfiLibrary,
  handle: FfiOpaque
): GuildChannel => {
  const b = channel(lib);
  const parentOut = lib.allocUInt64Out();
  const parentId = b.parentId(handle, parentOut)
    ? brandId<ChannelId>(lib.readUInt64Out(parentOut))
    : undefined;

  const lobbyOut = lib.allocHandle();
  const linkedLobby = b.linkedLobby(handle, lobbyOut)
    ? {
        lobbyId: brandId<LobbyId>(b.linkedLobbyId(lobbyOut)),
        applicationId: brandId<ApplicationId>(b.linkedLobbyAppId(lobbyOut))
      }
    : undefined;

  return {
    id: brandId<ChannelId>(b.id(handle)),
    name: readString(lib, handle, b.name),
    type: CHANNEL_TYPE_BY_CODE[Number(b.type(handle))] ?? `unknown`,
    position: Number(b.position(handle)),
    linkable: Boolean(b.isLinkable(handle)),
    viewableByAll: Boolean(b.viewableByAll(handle)),
    ...(parentId !== undefined ? { parentId } : {}),
    ...(linkedLobby ? { linkedLobby } : {})
  };
};

/** Read a native `GuildMinimal` handle into a plain {@link Guild} snapshot. */
export const readGuild = (lib: FfiLibrary, handle: FfiOpaque): Guild => {
  const b = guild(lib);
  return {
    id: brandId<GuildId>(b.id(handle)),
    name: readString(lib, handle, b.name)
  };
};
