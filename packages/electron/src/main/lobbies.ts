import {
  createOrJoinLobby,
  getLobby,
  getLobbyIds,
  getUserGuilds,
  getGuildChannels,
  onLobbyCreated,
  onLobbyDeleted,
  onLobbyUpdated,
  onLobbyMemberAdded,
  onLobbyMemberRemoved,
  onLobbyMemberUpdated,
  type Lobby,
  type LobbySnapshot
} from "@discordkit/native/lobbies";
import type { LobbyId, ChannelId, GuildId } from "@discordkit/native";
import { LOBBY_CHANNELS } from "../channels/lobbies.js";
import type { RegisterContext } from "../internal.js";

/** Serialize a live `Lobby` into the IPC shape (native owns the snapshot). */
const snapshot = (lobby: Lobby): LobbySnapshot => lobby.toJSON();

/**
 * Wire the lobbies domain: id-keyed RPC handlers (the live `Lobby` stays here and
 * is re-resolved per action) + the lobby/member event broadcasts. Imports ONLY
 * `@discordkit/native/lobbies`.
 */
export const registerLobbies = ({
  handle,
  broadcast,
  track
}: RegisterContext): void => {
  /** Re-resolve a live lobby by id or throw (it was left/deleted). */
  const requireLobby = (lobbyId: LobbyId): Lobby => {
    const lobby = getLobby(lobbyId);
    if (!lobby) {
      throw new Error(
        `No lobby ${lobbyId} for the current user — it may have been left or ` +
          `deleted. Re-check membership with lobbies.getIds().`
      );
    }
    return lobby;
  };

  handle(
    LOBBY_CHANNELS.createOrJoin,
    async (
      _e,
      secret: string,
      metadata?: {
        lobby?: Record<string, string>;
        member?: Record<string, string>;
      }
    ) =>
      snapshot(
        await createOrJoinLobby(secret, {
          metadata: metadata?.lobby,
          memberMetadata: metadata?.member
        })
      )
  );
  handle(LOBBY_CHANNELS.get, (_e, lobbyId: LobbyId) => {
    const lobby = getLobby(lobbyId);
    return lobby ? snapshot(lobby) : undefined;
  });
  handle(LOBBY_CHANNELS.getIds, () => getLobbyIds());
  handle(LOBBY_CHANNELS.leave, async (_e, lobbyId: LobbyId) =>
    requireLobby(lobbyId).leave()
  );
  handle(
    LOBBY_CHANNELS.linkChannel,
    async (_e, lobbyId: LobbyId, channelId: ChannelId) =>
      requireLobby(lobbyId).linkChannel(channelId)
  );
  handle(LOBBY_CHANNELS.unlinkChannel, async (_e, lobbyId: LobbyId) =>
    requireLobby(lobbyId).unlinkChannel()
  );
  handle(LOBBY_CHANNELS.getUserGuilds, async () => getUserGuilds());
  handle(LOBBY_CHANNELS.getGuildChannels, async (_e, guildId: GuildId) =>
    getGuildChannels(guildId)
  );

  track(onLobbyCreated((id) => broadcast(LOBBY_CHANNELS.created, id)));
  track(onLobbyDeleted((id) => broadcast(LOBBY_CHANNELS.deleted, id)));
  track(onLobbyUpdated((id) => broadcast(LOBBY_CHANNELS.updated, id)));
  track(
    onLobbyMemberAdded((lobbyId, memberId) =>
      broadcast(LOBBY_CHANNELS.memberAdded, lobbyId, memberId)
    )
  );
  track(
    onLobbyMemberRemoved((lobbyId, memberId) =>
      broadcast(LOBBY_CHANNELS.memberRemoved, lobbyId, memberId)
    )
  );
  track(
    onLobbyMemberUpdated((lobbyId, memberId) =>
      broadcast(LOBBY_CHANNELS.memberUpdated, lobbyId, memberId)
    )
  );
};
