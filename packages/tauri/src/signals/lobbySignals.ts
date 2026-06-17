import { Signal } from "signal-polyfill";
import type { LobbyId } from "@discordkit/native";
import type { LobbiesBridge, LobbySnapshot } from "../channels/lobbies.js";

/** The bridge slice the lobby-set signal needs. */
type LobbyIdsSource = Pick<LobbiesBridge, `getIds` | `onCreated` | `onDeleted`>;

/** The bridge slice the single-lobby signal needs. */
type LobbySource = Pick<
  LobbiesBridge,
  `get` | `onUpdated` | `onMemberAdded` | `onMemberRemoved` | `onMemberUpdated`
>;

/**
 * A `Signal.State<LobbyId[]>` of the lobbies the current user is in. Seeds from
 * `getIds()`, then keeps the set live via `onCreated`/`onDeleted`. Use it to
 * drive a lobby list; pair each id with {@link lobbySignal} for that lobby's
 * live contents.
 *
 * @example
 * ```ts
 * const ids = lobbyIdsSignal(discord.lobbies);
 * using off = subscribe(ids, (list) => renderLobbyTabs(list));
 * ```
 */
export const lobbyIdsSignal = (
  lobbies: LobbyIdsSource
): Signal.State<LobbyId[]> => {
  const state = new Signal.State<LobbyId[]>([]);
  lobbies.onCreated((id) => {
    if (!state.get().includes(id)) state.set([...state.get(), id]);
  });
  lobbies.onDeleted((id) => state.set(state.get().filter((x) => x !== id)));
  void (async (): Promise<void> => {
    state.set(await lobbies.getIds());
  })();
  return state;
};

/**
 * A `Signal.State<LobbySnapshot | undefined>` tracking ONE lobby's live state.
 * Seeds from `get(lobbyId)`, then re-fetches the snapshot whenever that lobby is
 * updated or its membership changes (filtering the client-wide lobby events to
 * `lobbyId`). `undefined` means the user isn't in the lobby (left/deleted).
 *
 * Re-fetching on each event is the right model here: lobby events carry only ids
 * (not the changed data), so the snapshot must be re-pulled to reflect the new
 * members/metadata.
 *
 * @example
 * ```ts
 * const lobby = lobbySignal(discord.lobbies, lobbyId);
 * using off = subscribe(lobby, (snap) => renderMemberList(snap?.members ?? []));
 * ```
 */
export const lobbySignal = (
  lobbies: LobbySource,
  lobbyId: LobbyId
): Signal.State<LobbySnapshot | undefined> => {
  const state = new Signal.State<LobbySnapshot | undefined>(undefined);

  const refresh = async (): Promise<void> => {
    state.set(await lobbies.get(lobbyId));
  };
  // Re-pull the snapshot on any change scoped to this lobby.
  const onThisLobby = (id: LobbyId): void => {
    if (id === lobbyId) void refresh();
  };
  lobbies.onUpdated(onThisLobby);
  lobbies.onMemberAdded((id) => onThisLobby(id));
  lobbies.onMemberRemoved((id) => onThisLobby(id));
  lobbies.onMemberUpdated((id) => onThisLobby(id));
  void refresh();
  return state;
};
