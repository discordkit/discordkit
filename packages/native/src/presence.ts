import { useClient } from "./ambient.js";
import type { DiscordClient } from "./client.js";
import type { FfiFunction, FfiLibrary, FfiOpaque } from "./ffi/backend.js";

/** Rich-presence activity type. Mirrors `Discord_ActivityTypes`. */
export type ActivityType =
  | `playing`
  | `streaming`
  | `listening`
  | `watching`
  | `competing`;

/** ABI numeric values for the activity types we expose (`Discord_ActivityTypes`). */
const ACTIVITY_TYPE: Record<ActivityType, number> = {
  playing: 0,
  streaming: 1,
  listening: 2,
  watching: 3,
  // 4 = CustomStatus (not settable via rich presence), 6 = HangStatus.
  competing: 5
};

/** A rich-presence activity, in plain-object form. */
export interface ActivityInput {
  /** Activity type. Default `playing`. */
  type?: ActivityType;
  /** First line under the app name (e.g. "In Competitive Match"). */
  state?: string;
  /** Second line (e.g. "Rank: Diamond II"). */
  details?: string;
  /** Overrides the displayed app name. */
  name?: string;
}

/** Mutable builder passed to the callback form of {@link setActivity}. */
export interface ActivityBuilder {
  type: ActivityType;
  state?: string;
  details?: string;
  name?: string;
}

/** Per-call options shared by presence operations. */
export interface PresenceOptions {
  /** Target a specific client instead of the ambient singleton. */
  client?: DiscordClient;
  /**
   * Milliseconds to wait for the SDK to acknowledge before rejecting. Default
   * 10000. Presence reaches Discord over an RPC link to the local desktop client
   * that takes a moment to establish; the call rejects (never hangs) if no ack
   * arrives — usually because Discord isn't running.
   */
  timeoutMs?: number;
}

interface PresenceBindings {
  activityInit: FfiFunction;
  activityDrop: FfiFunction;
  setType: FfiFunction;
  setName: FfiFunction;
  setState: FfiFunction;
  setDetails: FfiFunction;
  updateRichPresence: FfiFunction;
  updateRichPresenceCb: unknown;
  resultSuccessful: FfiFunction;
  resultErrorToString: FfiFunction;
}

/**
 * Presence C functions are bound lazily, per library, the first time presence is
 * used — and cached on the library object. Binding here (not in the client) is
 * what keeps `Discord_Client_UpdateRichPresence` / `Discord_Activity_*` out of
 * any consumer that imports only auth or only the lifecycle.
 */
const bindingsByLib = new WeakMap<FfiLibrary, PresenceBindings>();

const presenceBindings = (lib: FfiLibrary): PresenceBindings => {
  const cached = bindingsByLib.get(lib);
  if (cached) return cached;
  const bindings: PresenceBindings = {
    activityInit: lib.func(`void Discord_Activity_Init(void *self)`),
    activityDrop: lib.func(`void Discord_Activity_Drop(void *self)`),
    setType: lib.func(`void Discord_Activity_SetType(void *self, int value)`),
    setName: lib.func(
      `void Discord_Activity_SetName(void *self, Discord_String value)`
    ),
    // SetState/SetDetails take `Discord_String *` (nullable → pass null to clear).
    setState: lib.func(
      `void Discord_Activity_SetState(void *self, Discord_String *value)`
    ),
    setDetails: lib.func(
      `void Discord_Activity_SetDetails(void *self, Discord_String *value)`
    ),
    updateRichPresence: lib.func(
      `void Discord_Client_UpdateRichPresence(void *self, void *activity, void *cb, void *cbFree, void *cbUserData)`
    ),
    updateRichPresenceCb: lib.defineCallback(
      `void UpdateRichPresenceCallback(void *result, void *userData)`
    ),
    resultSuccessful: lib.func(
      `bool Discord_ClientResult_Successful(void *self)`
    ),
    resultErrorToString: lib.func(
      `void Discord_ClientResult_ToString(void *self, Discord_String *returnValue)`
    )
  };
  bindingsByLib.set(lib, bindings);
  return bindings;
};

/** Normalize either input form into a plain object. */
const toActivity = (
  input: ActivityInput | ((builder: ActivityBuilder) => void)
): ActivityInput => {
  if (typeof input !== `function`) return input;
  const builder: ActivityBuilder = { type: `playing` };
  input(builder);
  return builder;
};

/**
 * How long to wait for the SDK to acknowledge a rich-presence update before
 * giving up. Presence goes over RPC to the local Discord desktop client; that
 * link takes a few seconds to establish after the client is created, and the ack
 * callback only fires once it's up. Without a timeout, a not-yet-ready (or
 * absent) Discord client would hang the call forever.
 */
const DEFAULT_PRESENCE_TIMEOUT_MS = 10_000;

/**
 * Call `Discord_Client_UpdateRichPresence` and resolve/reject on the SDK's
 * result. Rejects (rather than hangs) if no ack arrives within the timeout —
 * the usual cause is the Discord desktop client not running, or its RPC link not
 * established yet. Also rejects on an unsuccessful result (surfacing what would
 * otherwise be a silent no-show).
 */
const dispatchPresence = async (
  client: DiscordClient,
  b: PresenceBindings,
  activityHandle: FfiOpaque,
  timeoutMs: number
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          `Rich presence update timed out after ${timeoutMs}ms with no response ` +
            `from the local Discord client. Is the Discord desktop app running?`
        )
      );
    }, timeoutMs);
    timer.unref?.();

    const cb = client.lib.registerCallback(
      b.updateRichPresenceCb,
      (result: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (b.resultSuccessful(result)) {
          resolve();
          return;
        }
        const out = client.lib.allocStringOut();
        b.resultErrorToString(result, out);
        reject(
          new Error(
            `Rich presence update failed: ${client.lib.decodeString(out)}`
          )
        );
      }
    );
    client.trackCallback(cb);
    b.updateRichPresence(client.handle, activityHandle, cb, null, null);
  });

/**
 * Set the user's rich presence. Accepts a plain object or a builder callback:
 *
 * ```ts
 * await setActivity({ type: "playing", state: "In Match", details: "Rank: Diamond II" });
 * await setActivity((a) => { a.type = "playing"; a.state = "In Match"; });
 * ```
 *
 * `UpdateRichPresence` replaces the current activity (it does not patch), so the
 * input fully describes the next presence. Resolves when the SDK acknowledges.
 */
export const setActivity = async (
  input: ActivityInput | ((builder: ActivityBuilder) => void),
  options: PresenceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = presenceBindings(client.lib);
  const activity = toActivity(input);

  const handle = client.lib.allocHandle();
  b.activityInit(handle);
  try {
    b.setType(handle, ACTIVITY_TYPE[activity.type ?? `playing`]);
    if (activity.name !== undefined) {
      b.setName(handle, client.lib.encodeString(activity.name));
    }
    // SetState/SetDetails take `Discord_String *` (nullable) — encodeStringPtr
    // returns a pointer to a Discord_String so the SDK reads the actual value.
    if (activity.state !== undefined) {
      b.setState(handle, client.lib.encodeStringPtr(activity.state));
    }
    if (activity.details !== undefined) {
      b.setDetails(handle, client.lib.encodeStringPtr(activity.details));
    }
    await dispatchPresence(
      client,
      b,
      handle,
      options.timeoutMs ?? DEFAULT_PRESENCE_TIMEOUT_MS
    );
  } finally {
    b.activityDrop(handle);
  }
};

/**
 * Clear the user's rich presence (set an empty activity). Resolves when the SDK
 * acknowledges.
 */
export const clearActivity = async (
  options: PresenceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = presenceBindings(client.lib);
  const handle = client.lib.allocHandle();
  b.activityInit(handle);
  try {
    await dispatchPresence(
      client,
      b,
      handle,
      options.timeoutMs ?? DEFAULT_PRESENCE_TIMEOUT_MS
    );
  } finally {
    b.activityDrop(handle);
  }
};
