import { useClient } from "../ambient.js";
import type { DiscordClient, Subscription } from "../client.js";
import { defineBindings } from "../ffi/bindings.js";

/**
 * The messaging domain's client-level event fan-out — same shape as the lobby
 * events: each `SetMessage*Callback` is a single client-wide SETTER, so this owns
 * ONE native callback per event per client (lazy, on first subscribe) and fans
 * out to a JS subscriber set. Events carry ids (created→messageId,
 * deleted→messageId+channelId, updated→messageId); re-fetch the message with
 * {@link ../messaging/messages.js | getMessage} if you need the snapshot (a
 * deleted message won't be fetchable — the event is the only signal).
 */
const bindings = defineBindings({
  setCreated: /* C */ `void Discord_Client_SetMessageCreatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setDeleted: /* C */ `void Discord_Client_SetMessageDeletedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  setUpdated: /* C */ `void Discord_Client_SetMessageUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
  // messageId-only (created / updated)
  messageCb: {
    callback: /* C */ `void MessageCallback(uint64_t messageId, void *userData)`
  },
  // messageId + channelId (deleted)
  deletedCb: {
    callback: /* C */ `void MessageDeletedCallback(uint64_t messageId, uint64_t channelId, void *userData)`
  }
});

type MessageEvent = `created` | `deleted` | `updated`;

const SETTER: Record<MessageEvent, keyof ReturnType<typeof bindings>> = {
  created: `setCreated`,
  deleted: `setDeleted`,
  updated: `setUpdated`
};

const registries = new WeakMap<
  DiscordClient,
  Partial<Record<MessageEvent, Set<(...args: bigint[]) => void>>>
>();

/** Get (or lazily create + wire the SDK callback for) one event's subscriber set. */
const subscribersFor = (
  client: DiscordClient,
  event: MessageEvent
): Set<(...args: bigint[]) => void> => {
  let byEvent = registries.get(client);
  if (!byEvent) {
    byEvent = {};
    registries.set(client, byEvent);
  }
  const existing = byEvent[event];
  if (existing) return existing;

  const subscribers = new Set<(...args: bigint[]) => void>();
  byEvent[event] = subscribers;
  const b = bindings(client.lib);
  const isDeleted = event === `deleted`;
  const cb = client.lib.registerCallback(
    isDeleted ? b.deletedCb : b.messageCb,
    (...args: unknown[]) => {
      const ids = args
        .slice(0, isDeleted ? 2 : 1)
        .map((a) => BigInt(a as bigint));
      for (const handler of subscribers) handler(...ids);
    }
  );
  client.trackCallback(cb);
  const setter = b[SETTER[event]] as (...a: unknown[]) => unknown;
  setter(client.handle, cb, null, null);
  return subscribers;
};

/** Per-call options shared by the message event subscriptions. */
export interface MessageEventOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
}

const subscribe = <H extends (...args: bigint[]) => void>(
  event: MessageEvent
): ((handler: H, options?: MessageEventOptions) => Subscription) => {
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

/** Subscribe to incoming messages. Handler gets the new message's id. */
export const onMessageCreated =
  subscribe<(messageId: bigint) => void>(`created`);
/** Subscribe to message edits. Handler gets the edited message's id. */
export const onMessageUpdated =
  subscribe<(messageId: bigint) => void>(`updated`);
/** Subscribe to message deletions. Handler gets the message id + its channel id. */
export const onMessageDeleted =
  subscribe<(messageId: bigint, channelId: bigint) => void>(`deleted`);
