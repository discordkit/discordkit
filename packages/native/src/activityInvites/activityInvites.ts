import { useClient } from "../ambient.js";
import { toSubscription } from "../client.js";
import type { DiscordClient, Subscription } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import { buildActivityInvite, readActivityInvite } from "./activityInvite.js";
import type { ActivityInvite } from "./types.js";

/**
 * The activity-invites domain's client-level operations — the join/spectate half
 * of the rich-presence story. Two callback shapes meet here:
 *
 * - **One-shot result ops** (`Send*`, `Accept*`) use {@link awaitResult}. Three
 *   resolve with nothing (`SendActivityInviteCallback(result)`); `accept`
 *   resolves with the **join secret** string (`AcceptActivityInviteCallback(result,
 *   joinSecret)`) — the value a game feeds into its own party system to actually
 *   join the sender.
 * - **Persistent event subscriptions** (`SetActivityInvite{Created,Updated}Callback`)
 *   fire an {@link ActivityInvite} repeatedly as invites arrive/change. These are
 *   NOT promises: like `client.onLog`, each registers a long-lived callback and
 *   returns a {@link Subscription} (an unsubscribe that's also `Disposable`). This
 *   is the slice's new shape — the first SDK event stream owned by a feature
 *   module rather than the core client. (If voice/messaging prove this repeats,
 *   extract a shared `subscribeEvent` helper then — not before.)
 *
 * Per the SDK docs: invites are sent as Discord messages, so the SDK parses them
 * for you and fires the created callback instead of a message-create. Never act on
 * an invite without explicit user intent.
 */
const bindings = defineBindings({
  send: /* C */ `void Discord_Client_SendActivityInvite(void *self, uint64_t userId, Discord_String content, void *cb, void *cbFree, void *cbUserData)`,
  sendJoinRequest: /* C */ `void Discord_Client_SendActivityJoinRequest(void *self, uint64_t userId, void *cb, void *cbFree, void *cbUserData)`,
  sendJoinRequestReply: /* C */ `void Discord_Client_SendActivityJoinRequestReply(void *self, void *invite, void *cb, void *cbFree, void *cbUserData)`,
  accept: /* C */ `void Discord_Client_AcceptActivityInvite(void *self, void *invite, void *cb, void *cbFree, void *cbUserData)`,
  setCreatedCb: /* C */ `void Discord_Client_SetActivityInviteCreatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setUpdatedCb: /* C */ `void Discord_Client_SetActivityInviteUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  // result(, joinSecret) — joinSecret only on AcceptActivityInvite
  sendCb: {
    callback: /* C */ `void SendActivityInviteCallback(void *result, void *userData)`
  },
  acceptCb: {
    callback: /* C */ `void AcceptActivityInviteCallback(void *result, Discord_String joinSecret, void *userData)`
  },
  // fired repeatedly with the parsed invite handle
  inviteCb: {
    callback: /* C */ `void ActivityInviteCallback(void *invite, void *userData)`
  }
});

/** Per-call options shared by activity-invite operations. */
export interface ActivityInviteOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /** Reject if the SDK hasn't acked within this many ms. Default 10000. */
  timeoutMs?: number;
}

/**
 * Invite a user to join the current user's activity (party). Sent as a Discord message; succeeds if the users are in-game together, friends, or share a server and have DM'd. `content` is optional extra message text (`""` to omit).
 */
export const sendActivityInvite = async (
  userId: bigint,
  content = ``,
  options: ActivityInviteOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult(
    client,
    b.sendCb,
    (ptr) =>
      b.send(
        client.handle,
        userId,
        client.lib.encodeString(content),
        ptr,
        null,
        null
      ),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `send activity invite` }
  );
};

/**
 * Request to join a user's activity. Valid when that user has a rich-presence activity for this game with room to join. They receive an invite they can accept or reject.
 */
export const sendActivityJoinRequest = async (
  userId: bigint,
  options: ActivityInviteOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  return awaitResult(
    client,
    b.sendCb,
    (ptr) => b.sendJoinRequest(client.handle, userId, ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `send activity join request` }
  );
};

/**
 * Reply to an incoming join request (when another user asked to join the current user's party), allowing them in. The SDK sends them an invite they then accept. Takes the {@link ActivityInvite} from the created callback.
 */
export const replyToActivityJoinRequest = async (
  invite: ActivityInvite,
  options: ActivityInviteOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  using built = buildActivityInvite(client.lib, invite);
  // `await` here (not a bare `return` of the promise) keeps the `using built`
  // handle alive until the SDK acks — a bare return drops it at scope exit,
  // mid-flight. The op resolves with nothing, so we don't return the void result.
  await awaitResult(
    client,
    b.sendCb,
    (ptr) =>
      b.sendJoinRequestReply(client.handle, built.handle, ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `reply to activity join request` }
  );
};

/**
 * Accept an activity invite the current user received, resolving with the **join secret** — pass it to your game's party system to actually join the sender (it comes from their rich-presence activity). Takes the {@link ActivityInvite} from the created callback.
 *
 * @example
 * ```ts
 * import {
 *   onActivityInviteCreated,
 *   acceptActivityInvite
 * } from "@discordkit/native/activity-invites";
 *
 * using sub = onActivityInviteCreated(async (invite) => {
 *   if (!invite.valid) return;            // expired / sender stopped playing
 *   const joinSecret = await acceptActivityInvite(invite);
 *   game.joinPartyFromSecret(joinSecret); // your game's own matchmaking
 * });
 * ```
 */
export const acceptActivityInvite = async (
  invite: ActivityInvite,
  options: ActivityInviteOptions = {}
): Promise<string> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  using built = buildActivityInvite(client.lib, invite);
  // `return await` (not bare `return`) keeps the `using built` handle alive until
  // the SDK acks — a bare return drops it at scope exit, mid-flight.
  return await awaitResult<string>(
    client,
    b.acceptCb,
    (ptr) => b.accept(client.handle, built.handle, ptr, null, null),
    (joinSecret) => client.lib.decodeString(joinSecret),
    { timeoutMs: options.timeoutMs, label: `accept activity invite` }
  );
};

/** Register a persistent invite-event subscription and return its {@link Subscription}. */
const subscribeInvite =
  (fn: `setCreatedCb` | `setUpdatedCb`) =>
  (
    handler: (invite: ActivityInvite) => void,
    options: { client?: DiscordClient } = {}
  ): Subscription => {
    const client = options.client ?? useClient();
    const b = bindings(client.lib);
    const cb = client.lib.registerCallback(b.inviteCb, (invite: unknown) => {
      handler(readActivityInvite(client.lib, invite));
    });
    client.trackCallback(cb);
    b[fn](client.handle, cb, null, null);

    return toSubscription(() => client.lib.unregisterCallback(cb));
  };

/**
 * Subscribe to incoming activity invites. The SDK parses invite messages and fires this with the parsed {@link ActivityInvite} (the message-create callback is suppressed for these). Pass the invite to {@link acceptActivityInvite}. Returns an unsubscribe / `Disposable`.
 */
export const onActivityInviteCreated = subscribeInvite(`setCreatedCb`);

/**
 * Subscribe to updates of activity invites already received (e.g. an invite becoming invalid). Returns an unsubscribe / `Disposable`.
 */
export const onActivityInviteUpdated = subscribeInvite(`setUpdatedCb`);
