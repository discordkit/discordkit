import { clientEventFanout, type EventOptions } from "../ffi/eventFanout.js";

/**
 * The messaging domain's client-wide event streams, built on the shared
 * {@link clientEventFanout} (each `SetMessage*Callback` is a single client-wide
 * setter fanned out to many JS subscribers). Events carry `uint64` ids —
 * created→messageId, updated→messageId, deleted→messageId+channelId — never
 * handles; re-fetch with `getMessage` if you need the snapshot (a deleted
 * message won't be fetchable, so the event is the only signal).
 */
const events = clientEventFanout({
  created: {
    setter: /* C */ `void Discord_Client_SetMessageCreatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void MessageCallback(uint64_t messageId, void *userData)`,
    arity: 1
  },
  updated: {
    setter: /* C */ `void Discord_Client_SetMessageUpdatedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void MessageCallback(uint64_t messageId, void *userData)`,
    arity: 1
  },
  deleted: {
    setter: /* C */ `void Discord_Client_SetMessageDeletedCallback(void *self, void *cb, void *cbFree, void *cbUserData)`,
    callback: /* C */ `void MessageDeletedCallback(uint64_t messageId, uint64_t channelId, void *userData)`,
    arity: 2
  }
});

/** Per-call options shared by the message event subscriptions. */
export type MessageEventOptions = EventOptions;

/** Subscribe to incoming messages. Handler gets the new message's id. */
export const onMessageCreated = events<(messageId: bigint) => void>(`created`);
/** Subscribe to message edits. Handler gets the edited message's id. */
export const onMessageUpdated = events<(messageId: bigint) => void>(`updated`);
/** Subscribe to message deletions. Handler gets the message id + its channel id. */
export const onMessageDeleted =
  events<(messageId: bigint, channelId: bigint) => void>(`deleted`);
