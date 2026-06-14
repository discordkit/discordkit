import { clientEventFanout, type EventOptions } from "../ffi/eventFanout.js";

/**
 * The lobby domain's client-wide event streams, built on the shared
 * {@link clientEventFanout} (each `SetLobby*Callback` is a single client-wide
 * setter fanned out to many JS subscribers). Events carry `uint64` ids —
 * `lobbyId`, and for member events `memberId` — never handles; re-fetch with
 * `getLobby` if you need the live wrapper. The `Lobby` wrapper's per-lobby `on*`
 * methods ride these same streams, filtering by lobby id.
 */
const events = clientEventFanout({
  created: {
    setter: /* C */ `void Discord_Client_SetLobbyCreatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyCallback(uint64_t lobbyId, void *userData)`,
    arity: 1
  },
  deleted: {
    setter: /* C */ `void Discord_Client_SetLobbyDeletedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyCallback(uint64_t lobbyId, void *userData)`,
    arity: 1
  },
  updated: {
    setter: /* C */ `void Discord_Client_SetLobbyUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyCallback(uint64_t lobbyId, void *userData)`,
    arity: 1
  },
  memberAdded: {
    setter: /* C */ `void Discord_Client_SetLobbyMemberAddedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyMemberCallback(uint64_t lobbyId, uint64_t memberId, void *userData)`,
    arity: 2
  },
  memberRemoved: {
    setter: /* C */ `void Discord_Client_SetLobbyMemberRemovedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyMemberCallback(uint64_t lobbyId, uint64_t memberId, void *userData)`,
    arity: 2
  },
  memberUpdated: {
    setter: /* C */ `void Discord_Client_SetLobbyMemberUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void LobbyMemberCallback(uint64_t lobbyId, uint64_t memberId, void *userData)`,
    arity: 2
  }
});

/** Per-call options shared by the lobby event subscriptions. */
export type LobbyEventOptions = EventOptions;

/** Subscribe to any lobby being created. Handler gets the new lobby's id. */
export const onLobbyCreated = events<(lobbyId: bigint) => void>(`created`);
/** Subscribe to any lobby being deleted. Handler gets the deleted lobby's id. */
export const onLobbyDeleted = events<(lobbyId: bigint) => void>(`deleted`);
/** Subscribe to any lobby being updated. Handler gets the lobby's id. */
export const onLobbyUpdated = events<(lobbyId: bigint) => void>(`updated`);
/** Subscribe to a member being added to any lobby. */
export const onLobbyMemberAdded =
  events<(lobbyId: bigint, memberId: bigint) => void>(`memberAdded`);
/** Subscribe to a member being removed from any lobby. */
export const onLobbyMemberRemoved =
  events<(lobbyId: bigint, memberId: bigint) => void>(`memberRemoved`);
/** Subscribe to a member of any lobby being updated. */
export const onLobbyMemberUpdated =
  events<(lobbyId: bigint, memberId: bigint) => void>(`memberUpdated`);
