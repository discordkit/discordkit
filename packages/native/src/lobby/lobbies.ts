import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import { brandId, brandIds, type GuildId, type LobbyId } from "../snowflake.js";
import { Lobby } from "./lobbyHandle.js";
import { readGuild, readGuildChannel } from "./guildChannel.js";
import type { Guild, GuildChannel } from "./types.js";

/**
 * The lobbies domain's client-level entry operations: create/join, fetch, and
 * the channel-linking discovery surface. The live {@link Lobby} wrapper (its
 * getters, leave/link/unlink, per-lobby events) lives in `lobbyHandle.ts`; the
 * client-wide lobby events live in `lobbyEvents.ts`. This module is what hands a
 * consumer their first `Lobby`.
 *
 * `createOrJoinLobby` is async (its callback yields a `lobbyId`); we then fetch
 * the handle synchronously and wrap it. `getLobby`/`getLobbyIds` are synchronous
 * reads of the SDK's cache. Guild/channel discovery is async, resolving with
 * snapshot arrays read from the callback's span.
 */
const bindings = defineBindings({
  createOrJoin: /* C */ `void Discord_Client_CreateOrJoinLobby(void *self, Discord_String secret, void *cb, void *cbFree, void *cbUserData)`,
  createOrJoinWithMetadata: /* C */ `void Discord_Client_CreateOrJoinLobbyWithMetadata(void *self, Discord_String secret, Discord_Properties lobbyMetadata, Discord_Properties memberMetadata, void *cb, void *cbFree, void *cbUserData)`,
  getLobbyHandle: /* C */ `bool Discord_Client_GetLobbyHandle(void *self, uint64_t lobbyId, void *returnValue)`,
  getLobbyIds: /* C */ `void Discord_Client_GetLobbyIds(void *self, Discord_Span *returnValue)`,
  getUserGuilds: /* C */ `void Discord_Client_GetUserGuilds(void *self, void *cb, void *cbFree, void *cbUserData)`,
  getGuildChannels: /* C */ `void Discord_Client_GetGuildChannels(void *self, uint64_t guildId, void *cb, void *cbFree, void *cbUserData)`,
  // result(, lobbyId) — CreateOrJoinLobby yields the joined lobby's id
  createCb: {
    callback: /* C */ `void CreateOrJoinLobbyCallback(void *result, uint64_t lobbyId, void *userData)`
  },
  guildsCb: {
    callback: /* C */ `void GetUserGuildsCallback(void *result, Discord_GuildMinimalSpan guilds, void *userData)`
  },
  channelsCb: {
    callback: /* C */ `void GetGuildChannelsCallback(void *result, Discord_GuildChannelSpan channels, void *userData)`
  }
});

/** Per-call options shared by lobby entry operations. */
export interface LobbyOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /** Reject if the SDK hasn't acked within this many ms. Default 10000. */
  timeoutMs?: number;
}

/** Fetch a lobby handle by id and wrap it, or `undefined` if not a member. */
const wrapLobby = (
  client: DiscordClient,
  lobbyId: LobbyId
): Lobby | undefined => {
  const out = client.lib.allocHandle();
  return bindings(client.lib).getLobbyHandle(
    client.handle,
    BigInt(lobbyId),
    out
  )
    ? new Lobby(client, out)
    : undefined;
};

/**
 * Join the lobby for a game-generated secret, creating it if needed (the no-server-API path). Resolves with the live {@link Lobby}. NOTE per the SDK: secret-based lobbies auto-expire after 30 days — use the Server API for permanent lobbies. Optionally seed lobby + member metadata.
 */
export const createOrJoinLobby = async (
  secret: string,
  options: LobbyOptions & {
    /** Developer metadata to set on the lobby. */
    metadata?: Record<string, string>;
    /** Developer metadata to set on the current user's membership. */
    memberMetadata?: Record<string, string>;
  } = {}
): Promise<Lobby> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  const hasMeta = options.metadata ?? options.memberMetadata;
  const lobbyId = await awaitResult<LobbyId>(
    client,
    b.createCb,
    (ptr) =>
      hasMeta
        ? b.createOrJoinWithMetadata(
            client.handle,
            client.lib.encodeString(secret),
            client.lib.encodeProperties(options.metadata ?? {}),
            client.lib.encodeProperties(options.memberMetadata ?? {}),
            ptr,
            null,
            null
          )
        : b.createOrJoin(
            client.handle,
            client.lib.encodeString(secret),
            ptr,
            null,
            null
          ),
    (id) => brandId<LobbyId>(id as bigint | number),
    { timeoutMs: options.timeoutMs, label: `create or join lobby` }
  );
  const lobby = wrapLobby(client, lobbyId);
  if (!lobby) {
    throw new Error(
      `Joined lobby ${lobbyId} but the SDK returned no handle for it. This ` +
        `should not happen; check that the client is connected (status Ready).`
    );
  }
  return lobby;
};

/**
 * Get a lobby the current user is a member of, by id, as a live {@link Lobby} — or `undefined` if they're not a member. Synchronous (reads the SDK's cache).
 */
export const getLobby = (
  lobbyId: LobbyId,
  options: { client?: DiscordClient } = {}
): Lobby | undefined => wrapLobby(options.client ?? useClient(), lobbyId);

/**
 * Get the ids of every lobby the current user is a member of. Synchronous. Wrap any of them with {@link getLobby}.
 */
export const getLobbyIds = (
  options: { client?: DiscordClient } = {}
): LobbyId[] => {
  const client = options.client ?? useClient();
  const span = client.lib.allocSpanOut();
  bindings(client.lib).getLobbyIds(client.handle, span);
  return brandIds<LobbyId>(client.lib.readUInt64Span(span));
};

/**
 * Fetch the guilds (servers) the current user belongs to that contain channels linkable to a lobby — the first half of building a "pick a server/channel to link" UI (then {@link getGuildChannels}). Resolves with {@link Guild} snapshots.
 */
export const getUserGuilds = async (
  options: LobbyOptions = {}
): Promise<Guild[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<Guild[]>(
    client,
    b.guildsCb,
    (ptr) => b.getUserGuilds(client.handle, ptr, null, null),
    (span) => client.lib.readSpan(span).map((h) => readGuild(client.lib, h)),
    { timeoutMs: options.timeoutMs, label: `get user guilds` }
  );
};

/**
 * Fetch the channels of one guild the current user can see — the candidates for linking a lobby to a Discord channel. Inspect each {@link GuildChannel}'s `linkable` / `viewableByAll` before offering it (see the SDK's private-channel warning). Resolves with snapshots.
 */
export const getGuildChannels = async (
  guildId: GuildId,
  options: LobbyOptions = {}
): Promise<GuildChannel[]> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult<GuildChannel[]>(
    client,
    b.channelsCb,
    (ptr) =>
      b.getGuildChannels(client.handle, BigInt(guildId), ptr, null, null),
    (span) =>
      client.lib.readSpan(span).map((h) => readGuildChannel(client.lib, h)),
    { timeoutMs: options.timeoutMs, label: `get guild channels` }
  );
};
