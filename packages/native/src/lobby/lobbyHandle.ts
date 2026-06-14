import type { DiscordClient, Subscription } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import type { FfiOpaque } from "../ffi/backend.js";
import { readLinkedChannel } from "./linkedChannel.js";
import { readLobbyMember } from "./lobbyMember.js";
import {
  onLobbyMemberAdded,
  onLobbyMemberRemoved,
  onLobbyMemberUpdated,
  onLobbyUpdated
} from "./lobbyEvents.js";
import type { LinkedChannel, LobbyMember, LobbyMetadata } from "./types.js";

/**
 * A live wrapper over a native `discordpp::LobbyHandle` — the package's first
 * interactive handle wrapper besides `DiscordClient`, and the case §1.4 reserves
 * a class for: the SDK docs are explicit that a lobby handle holds a LIVE
 * reference whose underlying data updates in place, and a lobby is long-lived,
 * interactive, and event-driven.
 *
 * Consequences of "live", encoded here:
 * - **Getters re-read every access** (`members`, `metadata`, `linkedChannel`) —
 *   they reflect the current SDK state, not a one-time snapshot. The *returned*
 *   values are still plain snapshots (a `LobbyMember[]`, a `Record`), since those
 *   sub-objects are read-only.
 * - **Events are per-lobby sugar** over the domain's client-level event fan-out
 *   (`onLobby*` in `lobbyEvents.ts`): the SDK's `SetLobby*Callback` is a single
 *   client-wide setter, so the domain owns one callback per event and this class
 *   subscribes + filters by `this.id`.
 *
 * Flat class, no inheritance, `#private` state, arrow methods (destructuring-safe),
 * `[Symbol.dispose]` — mirrors `DiscordClient`. A `Lobby` does NOT own the native
 * handle's lifetime (the SDK does; you `leave()` it, you don't free it), so
 * dispose only tears down this wrapper's event subscriptions.
 *
 * @example
 * ```ts
 * import { createOrJoinLobby } from "@discordkit/native/lobbies";
 *
 * using lobby = await createOrJoinLobby(secret);
 * console.log(lobby.members.map((m) => m.user?.username));
 * using sub = lobby.onMemberAdded((memberId) => console.log("joined:", memberId));
 * await lobby.linkChannel(channelId); // mirror messages to a Discord channel
 * // …later
 * await lobby.leave();
 * ```
 */
const bindings = defineBindings({
  id: /* C */ `uint64_t Discord_LobbyHandle_Id(void *self)`,
  memberIds: /* C */ `void Discord_LobbyHandle_LobbyMemberIds(void *self, Discord_UInt64Span *returnValue)`,
  members: /* C */ `void Discord_LobbyHandle_LobbyMembers(void *self, Discord_LobbyMemberHandleSpan *returnValue)`,
  memberById: /* C */ `bool Discord_LobbyHandle_GetLobbyMemberHandle(void *self, uint64_t memberId, Discord_LobbyMemberHandle *returnValue)`,
  metadata: /* C */ `void Discord_LobbyHandle_Metadata(void *self, Discord_Properties *returnValue)`,
  linkedChannel: /* C */ `bool Discord_LobbyHandle_LinkedChannel(void *self, Discord_LinkedChannel *returnValue)`,
  // Client-level ops keyed by lobby id (the lobby domain owns these declarations).
  leave: /* C */ `void Discord_Client_LeaveLobby(void *self, uint64_t lobbyId, void *cb, void *cbFree, void *cbUserData)`,
  link: /* C */ `void Discord_Client_LinkChannelToLobby(void *self, uint64_t lobbyId, uint64_t channelId, void *cb, void *cbFree, void *cbUserData)`,
  unlink: /* C */ `void Discord_Client_UnlinkChannelFromLobby(void *self, uint64_t lobbyId, void *cb, void *cbFree, void *cbUserData)`,
  leaveCb: {
    callback: /* C */ `void LeaveLobbyCallback(void *result, void *userData)`
  },
  linkCb: {
    callback: /* C */ `void LinkOrUnlinkChannelCallback(void *result, void *userData)`
  }
});

/** A live, interactive lobby. Created by the lobby domain's ops, never directly. */
export class Lobby {
  readonly #client: DiscordClient;
  readonly #handle: FfiOpaque;
  readonly #id: bigint;
  readonly #subscriptions = new Set<Subscription>();

  /** @internal Construct from a fetched handle. Use the domain ops, not this. */
  constructor(client: DiscordClient, handle: FfiOpaque) {
    this.#client = client;
    this.#handle = handle;
    this.#id = bindings(client.lib).id(handle) as bigint;
  }

  /** The lobby's id. */
  get id(): bigint {
    return this.#id;
  }

  /** The current member user ids (re-read live from the SDK). */
  get memberIds(): bigint[] {
    const span = this.#client.lib.allocSpanOut();
    bindings(this.#client.lib).memberIds(this.#handle, span);
    return this.#client.lib.readUInt64Span(span);
  }

  /** The current lobby members as snapshots (re-read live from the SDK). */
  get members(): LobbyMember[] {
    const span = this.#client.lib.allocSpanOut();
    bindings(this.#client.lib).members(this.#handle, span);
    return this.#client.lib
      .readSpan(span)
      .map((h) => readLobbyMember(this.#client.lib, h));
  }

  /** Developer metadata on the lobby (re-read live). */
  get metadata(): LobbyMetadata {
    const out = this.#client.lib.allocPropertiesOut();
    bindings(this.#client.lib).metadata(this.#handle, out);
    return this.#client.lib.readProperties(out);
  }

  /** The Discord channel this lobby is linked to, if any (re-read live). */
  get linkedChannel(): LinkedChannel | undefined {
    const out = this.#client.lib.allocHandle();
    return bindings(this.#client.lib).linkedChannel(this.#handle, out)
      ? readLinkedChannel(this.#client.lib, out)
      : undefined;
  }

  /** Read one member by user id, if they belong to this lobby (live). */
  member = (memberId: bigint): LobbyMember | undefined => {
    const out = this.#client.lib.allocHandle();
    return bindings(this.#client.lib).memberById(this.#handle, memberId, out)
      ? readLobbyMember(this.#client.lib, out)
      : undefined;
  };

  /** Leave this lobby. Resolves when the SDK acks. */
  leave = async (): Promise<void> => {
    const b = bindings(this.#client.lib);
    await awaitResult(
      this.#client,
      b.leaveCb,
      (ptr) => b.leave(this.#client.handle, this.#id, ptr, null, null),
      () => undefined,
      { label: `leave lobby` }
    );
  };

  /** Link a Discord channel to this lobby. Resolves when the SDK acks. */
  linkChannel = async (channelId: bigint): Promise<void> => {
    const b = bindings(this.#client.lib);
    await awaitResult(
      this.#client,
      b.linkCb,
      (ptr) =>
        b.link(this.#client.handle, this.#id, channelId, ptr, null, null),
      () => undefined,
      { label: `link channel to lobby` }
    );
  };

  /** Unlink this lobby's Discord channel. Resolves when the SDK acks. */
  unlinkChannel = async (): Promise<void> => {
    const b = bindings(this.#client.lib);
    await awaitResult(
      this.#client,
      b.linkCb,
      (ptr) => b.unlink(this.#client.handle, this.#id, ptr, null, null),
      () => undefined,
      { label: `unlink channel from lobby` }
    );
  };

  /** Track a subscription so dispose tears it down with the wrapper. */
  #track = (sub: Subscription): Subscription => {
    this.#subscriptions.add(sub);
    const off = (): void => {
      sub();
      this.#subscriptions.delete(sub);
    };
    return Object.assign(off, { [Symbol.dispose]: off }) as Subscription;
  };

  /** Subscribe to this lobby being updated (metadata/link changes). */
  onUpdated = (handler: () => void): Subscription =>
    this.#track(
      onLobbyUpdated(
        (lobbyId) => {
          if (lobbyId === this.#id) handler();
        },
        { client: this.#client }
      )
    );

  /** Subscribe to a member joining this lobby. */
  onMemberAdded = (handler: (memberId: bigint) => void): Subscription =>
    this.#track(
      onLobbyMemberAdded(
        (lobbyId, memberId) => {
          if (lobbyId === this.#id) handler(memberId);
        },
        { client: this.#client }
      )
    );

  /** Subscribe to a member leaving this lobby. */
  onMemberRemoved = (handler: (memberId: bigint) => void): Subscription =>
    this.#track(
      onLobbyMemberRemoved(
        (lobbyId, memberId) => {
          if (lobbyId === this.#id) handler(memberId);
        },
        { client: this.#client }
      )
    );

  /** Subscribe to a member of this lobby being updated. */
  onMemberUpdated = (handler: (memberId: bigint) => void): Subscription =>
    this.#track(
      onLobbyMemberUpdated(
        (lobbyId, memberId) => {
          if (lobbyId === this.#id) handler(memberId);
        },
        { client: this.#client }
      )
    );

  /** Tear down this wrapper's event subscriptions. Does NOT leave the lobby. */
  [Symbol.dispose] = (): void => {
    for (const sub of this.#subscriptions) sub();
    this.#subscriptions.clear();
  };
}
