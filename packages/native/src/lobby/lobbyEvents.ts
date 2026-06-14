import { useClient } from "../ambient.js";
import type { DiscordClient, Subscription } from "../client.js";
import { defineBindings } from "../ffi/bindings.js";

/**
 * The lobby domain's client-level event fan-out.
 *
 * Each SDK lobby event (`SetLobby*Callback`) is a single client-wide SETTER, not
 * an add — registering one per subscriber would clobber the previous. So this
 * module owns ONE native callback per event per client, registered lazily on the
 * first subscribe, and fans it out to a JS subscriber set. Both the free-function
 * `onLobby*` exports and the `Lobby` wrapper's per-lobby `on*` methods (which
 * filter by lobby id) ride this single callback. Mirrors `DiscordClient.onLog`,
 * generalized to a feature.
 *
 * Lobby events carry only ids (`lobbyId`, and for member events `memberId`) as
 * `uint64` — never handles — so handlers receive bigints and re-fetch via
 * `getLobby` if they need the live wrapper.
 */
const bindings = defineBindings({
  setCreated: /* C */ `void Discord_Client_SetLobbyCreatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setDeleted: /* C */ `void Discord_Client_SetLobbyDeletedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setUpdated: /* C */ `void Discord_Client_SetLobbyUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setMemberAdded: /* C */ `void Discord_Client_SetLobbyMemberAddedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setMemberRemoved: /* C */ `void Discord_Client_SetLobbyMemberRemovedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setMemberUpdated: /* C */ `void Discord_Client_SetLobbyMemberUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  // lobbyId-only events
  lobbyCb: {
    callback: /* C */ `void LobbyCallback(uint64_t lobbyId, void *userData)`
  },
  // lobbyId + memberId events
  memberCb: {
    callback: /* C */ `void LobbyMemberCallback(uint64_t lobbyId, uint64_t memberId, void *userData)`
  }
});

/** The six lobby events, with which SDK setter + callback prototype each uses. */
type LobbyEvent =
  | `created`
  | `deleted`
  | `updated`
  | `memberAdded`
  | `memberRemoved`
  | `memberUpdated`;

const SETTER: Record<LobbyEvent, keyof ReturnType<typeof bindings>> = {
  created: `setCreated`,
  deleted: `setDeleted`,
  updated: `setUpdated`,
  memberAdded: `setMemberAdded`,
  memberRemoved: `setMemberRemoved`,
  memberUpdated: `setMemberUpdated`
};
const IS_MEMBER_EVENT: Record<LobbyEvent, boolean> = {
  created: false,
  deleted: false,
  updated: false,
  memberAdded: true,
  memberRemoved: true,
  memberUpdated: true
};

/** Per-client, per-event subscriber sets. Keyed by client then event. */
const registries = new WeakMap<
  DiscordClient,
  Partial<Record<LobbyEvent, Set<(...args: bigint[]) => void>>>
>();

/** Get (or lazily create + register the SDK callback for) one event's subscriber set. */
const subscribersFor = (
  client: DiscordClient,
  event: LobbyEvent
): Set<(...args: bigint[]) => void> => {
  let byEvent = registries.get(client);
  if (!byEvent) {
    byEvent = {};
    registries.set(client, byEvent);
  }
  const existing = byEvent[event];
  if (existing) return existing;

  // First subscriber for this event: create the set and wire the SDK callback
  // once. `subscribers` is a const so the callback closure keeps it non-nullable.
  const subscribers = new Set<(...args: bigint[]) => void>();
  byEvent[event] = subscribers;
  const b = bindings(client.lib);
  const isMember = IS_MEMBER_EVENT[event];
  const cb = client.lib.registerCallback(
    isMember ? b.memberCb : b.lobbyCb,
    (...args: unknown[]) => {
      const ids = args
        .slice(0, isMember ? 2 : 1)
        .map((a) => BigInt(a as bigint));
      for (const handler of subscribers) handler(...ids);
    }
  );
  client.trackCallback(cb);
  const setter = b[SETTER[event]] as (...a: unknown[]) => unknown;
  setter(client.handle, cb, null, null);
  return subscribers;
};

/** Per-call options shared by the lobby event subscriptions. */
export interface LobbyEventOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

/** Subscribe to one event, returning a `Subscription` (unsubscribe + Disposable). */
const subscribe = <H extends (...args: bigint[]) => void>(
  event: LobbyEvent
): ((handler: H, options?: LobbyEventOptions) => Subscription) => {
  return (handler, options = {}) => {
    const client = options.client ?? useClient();
    const set = subscribersFor(client, event);
    set.add(handler);
    let disposed = false;
    const off = (): void => {
      if (disposed) return;
      disposed = true;
      set.delete(handler);
    };
    return Object.assign(off, { [Symbol.dispose]: off }) as Subscription;
  };
};

/** Subscribe to any lobby being created. Handler gets the new lobby's id. */
export const onLobbyCreated = subscribe<(lobbyId: bigint) => void>(`created`);
/** Subscribe to any lobby being deleted. Handler gets the deleted lobby's id. */
export const onLobbyDeleted = subscribe<(lobbyId: bigint) => void>(`deleted`);
/** Subscribe to any lobby being updated. Handler gets the lobby's id. */
export const onLobbyUpdated = subscribe<(lobbyId: bigint) => void>(`updated`);
/** Subscribe to a member being added to any lobby. */
export const onLobbyMemberAdded =
  subscribe<(lobbyId: bigint, memberId: bigint) => void>(`memberAdded`);
/** Subscribe to a member being removed from any lobby. */
export const onLobbyMemberRemoved =
  subscribe<(lobbyId: bigint, memberId: bigint) => void>(`memberRemoved`);
/** Subscribe to a member of any lobby being updated. */
export const onLobbyMemberUpdated =
  subscribe<(lobbyId: bigint, memberId: bigint) => void>(`memberUpdated`);
