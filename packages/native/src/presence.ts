import { useClient } from "./ambient.js";
import type { DiscordClient } from "./client.js";
import type { FfiFunction, FfiLibrary } from "./ffi/backend.js";

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
    if (activity.state !== undefined) {
      b.setState(handle, client.lib.encodeString(activity.state));
    }
    if (activity.details !== undefined) {
      b.setDetails(handle, client.lib.encodeString(activity.details));
    }

    await new Promise<void>((resolve) => {
      const cb = client.lib.registerCallback(b.updateRichPresenceCb, () => {
        resolve();
      });
      client.trackCallback(cb);
      b.updateRichPresence(client.handle, handle, cb, null, null);
    });
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
    await new Promise<void>((resolve) => {
      const cb = client.lib.registerCallback(b.updateRichPresenceCb, () => {
        resolve();
      });
      client.trackCallback(cb);
      b.updateRichPresence(client.handle, handle, cb, null, null);
    });
  } finally {
    b.activityDrop(handle);
  }
};
