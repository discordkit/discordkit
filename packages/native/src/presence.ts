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

/** Art assets shown on the activity card (`Discord_ActivityAssets`). Image
 * fields are **asset keys** uploaded under the app's Rich Presence → Art Assets
 * (or external image URLs, where supported). */
export interface ActivityAssets {
  /** Large image: asset key (or URL). */
  largeImage?: string;
  /** Tooltip text shown when hovering the large image. */
  largeText?: string;
  /** Makes the large image a clickable link. */
  largeUrl?: string;
  /** Small image (overlaid on the large one): asset key (or URL). */
  smallImage?: string;
  /** Tooltip text shown when hovering the small image. */
  smallText?: string;
  /** Makes the small image a clickable link. */
  smallUrl?: string;
}

/** Start/end of the activity, as Unix epoch **milliseconds**. A `start` renders
 * "elapsed" (e.g. "02:34 elapsed"); an `end` renders "remaining". */
export interface ActivityTimestamps {
  start?: number;
  end?: number;
}

/** Party info — renders as "(current of max)" next to the state. */
export interface ActivityParty {
  id?: string;
  currentSize?: number;
  maxSize?: number;
}

/** A clickable button on the activity card. Discord shows at most two. */
export interface ActivityButton {
  label: string;
  url: string;
}

/** A rich-presence activity, in plain-object form. Field names mirror Discord's
 * Rich Presence vocabulary (and the Developer Portal visualizer). */
export interface ActivityInput {
  /** Activity type. Default `playing`. */
  type?: ActivityType;
  /** Overrides the displayed app name (top line of the card). */
  name?: string;
  /** First line under the app name (e.g. "In Competitive Match"). */
  state?: string;
  /** Second line (e.g. "Rank: Diamond II"). */
  details?: string;
  /** Makes `state` a clickable link. */
  stateUrl?: string;
  /** Makes `details` a clickable link. */
  detailsUrl?: string;
  /** Large/small images + tooltips. */
  assets?: ActivityAssets;
  /** Elapsed/remaining timestamps (epoch ms). */
  timestamps?: ActivityTimestamps;
  /** Party size info. */
  party?: ActivityParty;
  /** Up to two clickable buttons. */
  buttons?: ActivityButton[];
}

/** Mutable builder passed to the callback form of {@link setActivity}. Same
 * shape as {@link ActivityInput} but with `type` required, for in-place edits. */
export interface ActivityBuilder extends ActivityInput {
  type: ActivityType;
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
  setStateUrl: FfiFunction;
  setDetails: FfiFunction;
  setDetailsUrl: FfiFunction;
  setAssets: FfiFunction;
  setTimestamps: FfiFunction;
  setParty: FfiFunction;
  addButton: FfiFunction;
  // assets sub-object
  assetsInit: FfiFunction;
  assetsDrop: FfiFunction;
  assetsSetLargeImage: FfiFunction;
  assetsSetLargeText: FfiFunction;
  assetsSetLargeUrl: FfiFunction;
  assetsSetSmallImage: FfiFunction;
  assetsSetSmallText: FfiFunction;
  assetsSetSmallUrl: FfiFunction;
  // timestamps sub-object
  timestampsInit: FfiFunction;
  timestampsDrop: FfiFunction;
  timestampsSetStart: FfiFunction;
  timestampsSetEnd: FfiFunction;
  // party sub-object
  partyInit: FfiFunction;
  partyDrop: FfiFunction;
  partySetId: FfiFunction;
  partySetCurrentSize: FfiFunction;
  partySetMaxSize: FfiFunction;
  // button sub-object
  buttonInit: FfiFunction;
  buttonDrop: FfiFunction;
  buttonSetLabel: FfiFunction;
  buttonSetUrl: FfiFunction;
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
    // SetState/SetDetails/*Url take `Discord_String *` (use encodeStringPtr).
    setState: lib.func(
      `void Discord_Activity_SetState(void *self, Discord_String *value)`
    ),
    setStateUrl: lib.func(
      `void Discord_Activity_SetStateUrl(void *self, Discord_String *value)`
    ),
    setDetails: lib.func(
      `void Discord_Activity_SetDetails(void *self, Discord_String *value)`
    ),
    setDetailsUrl: lib.func(
      `void Discord_Activity_SetDetailsUrl(void *self, Discord_String *value)`
    ),
    // Sub-object attach (pass the sub-handle pointer as void*).
    setAssets: lib.func(
      `void Discord_Activity_SetAssets(void *self, void *value)`
    ),
    setTimestamps: lib.func(
      `void Discord_Activity_SetTimestamps(void *self, void *value)`
    ),
    setParty: lib.func(
      `void Discord_Activity_SetParty(void *self, void *value)`
    ),
    addButton: lib.func(
      `void Discord_Activity_AddButton(void *self, void *button)`
    ),
    // --- assets sub-object (all image/text/url are Discord_String*) ---
    assetsInit: lib.func(`void Discord_ActivityAssets_Init(void *self)`),
    assetsDrop: lib.func(`void Discord_ActivityAssets_Drop(void *self)`),
    assetsSetLargeImage: lib.func(
      `void Discord_ActivityAssets_SetLargeImage(void *self, Discord_String *value)`
    ),
    assetsSetLargeText: lib.func(
      `void Discord_ActivityAssets_SetLargeText(void *self, Discord_String *value)`
    ),
    assetsSetLargeUrl: lib.func(
      `void Discord_ActivityAssets_SetLargeUrl(void *self, Discord_String *value)`
    ),
    assetsSetSmallImage: lib.func(
      `void Discord_ActivityAssets_SetSmallImage(void *self, Discord_String *value)`
    ),
    assetsSetSmallText: lib.func(
      `void Discord_ActivityAssets_SetSmallText(void *self, Discord_String *value)`
    ),
    assetsSetSmallUrl: lib.func(
      `void Discord_ActivityAssets_SetSmallUrl(void *self, Discord_String *value)`
    ),
    // --- timestamps sub-object (uint64 by value, epoch ms) ---
    timestampsInit: lib.func(
      `void Discord_ActivityTimestamps_Init(void *self)`
    ),
    timestampsDrop: lib.func(
      `void Discord_ActivityTimestamps_Drop(void *self)`
    ),
    timestampsSetStart: lib.func(
      `void Discord_ActivityTimestamps_SetStart(void *self, uint64_t value)`
    ),
    timestampsSetEnd: lib.func(
      `void Discord_ActivityTimestamps_SetEnd(void *self, uint64_t value)`
    ),
    // --- party sub-object (id by value String; sizes int32) ---
    partyInit: lib.func(`void Discord_ActivityParty_Init(void *self)`),
    partyDrop: lib.func(`void Discord_ActivityParty_Drop(void *self)`),
    partySetId: lib.func(
      `void Discord_ActivityParty_SetId(void *self, Discord_String value)`
    ),
    partySetCurrentSize: lib.func(
      `void Discord_ActivityParty_SetCurrentSize(void *self, int32_t value)`
    ),
    partySetMaxSize: lib.func(
      `void Discord_ActivityParty_SetMaxSize(void *self, int32_t value)`
    ),
    // --- button sub-object (label/url by value String) ---
    buttonInit: lib.func(`void Discord_ActivityButton_Init(void *self)`),
    buttonDrop: lib.func(`void Discord_ActivityButton_Drop(void *self)`),
    buttonSetLabel: lib.func(
      `void Discord_ActivityButton_SetLabel(void *self, Discord_String value)`
    ),
    buttonSetUrl: lib.func(
      `void Discord_ActivityButton_SetUrl(void *self, Discord_String value)`
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
 * Populate an initialized `Discord_Activity` handle from an {@link ActivityInput},
 * building the sub-objects (assets/timestamps/party/buttons) as needed. Returns
 * the sub-object handles so the caller can `Drop` them after the SDK has copied
 * the activity. Marshaling rules (all verified against the real SDK): `*`-typed
 * string params → `encodeStringPtr`; by-value strings → `encodeString`; uint64
 * timestamps + int32 sizes → numbers; sub-object attach → the handle pointer.
 */
const applyActivity = (
  lib: FfiLibrary,
  b: PresenceBindings,
  handle: FfiOpaque,
  a: ActivityInput
): (() => void) => {
  // Each sub-object handle is paired with its own Drop so cleanup is correct
  // regardless of type. Returned as one closure the caller runs after dispatch.
  const cleanups: Array<() => void> = [];

  // Skip EMPTY strings, not just undefined: the SDK rejects empty values for
  // length-constrained fields (image keys must be 1–300 chars), and an empty
  // string is semantically "unset" for every text field. So a cleared input
  // (RHF holds `""`) is correctly treated as absent.
  b.setType(handle, ACTIVITY_TYPE[a.type ?? `playing`]);
  if (a.name) b.setName(handle, lib.encodeString(a.name));
  if (a.state) b.setState(handle, lib.encodeStringPtr(a.state));
  if (a.stateUrl) b.setStateUrl(handle, lib.encodeStringPtr(a.stateUrl));
  if (a.details) b.setDetails(handle, lib.encodeStringPtr(a.details));
  if (a.detailsUrl) b.setDetailsUrl(handle, lib.encodeStringPtr(a.detailsUrl));

  const assetFields = a.assets ?? {};
  const hasAssets = Object.values(assetFields).some(Boolean);
  if (hasAssets) {
    const assets = lib.allocHandle();
    b.assetsInit(assets);
    cleanups.push(() => b.assetsDrop(assets));
    const { largeImage, largeText, largeUrl, smallImage, smallText, smallUrl } =
      assetFields;
    if (largeImage)
      b.assetsSetLargeImage(assets, lib.encodeStringPtr(largeImage));
    if (largeText) b.assetsSetLargeText(assets, lib.encodeStringPtr(largeText));
    if (largeUrl) b.assetsSetLargeUrl(assets, lib.encodeStringPtr(largeUrl));
    if (smallImage)
      b.assetsSetSmallImage(assets, lib.encodeStringPtr(smallImage));
    if (smallText) b.assetsSetSmallText(assets, lib.encodeStringPtr(smallText));
    if (smallUrl) b.assetsSetSmallUrl(assets, lib.encodeStringPtr(smallUrl));
    b.setAssets(handle, assets);
  }

  if (a.timestamps) {
    const ts = lib.allocHandle();
    b.timestampsInit(ts);
    cleanups.push(() => b.timestampsDrop(ts));
    if (a.timestamps.start !== undefined)
      b.timestampsSetStart(ts, BigInt(a.timestamps.start));
    if (a.timestamps.end !== undefined)
      b.timestampsSetEnd(ts, BigInt(a.timestamps.end));
    b.setTimestamps(handle, ts);
  }

  // Discord REQUIRES a party id (2–128 chars) when a party is present, so only
  // build the party when an id is supplied — sizes alone would be rejected.
  if (a.party?.id) {
    const party = lib.allocHandle();
    b.partyInit(party);
    cleanups.push(() => b.partyDrop(party));
    b.partySetId(party, lib.encodeString(a.party.id));
    if (a.party.currentSize !== undefined)
      b.partySetCurrentSize(party, a.party.currentSize);
    if (a.party.maxSize !== undefined)
      b.partySetMaxSize(party, a.party.maxSize);
    b.setParty(handle, party);
  }

  // Discord shows at most two buttons; skip empties and cap to avoid building
  // handles that won't render (or would be rejected for empty label/url).
  for (const button of (a.buttons ?? [])
    .filter((x) => x.label && x.url)
    .slice(0, 2)) {
    const btn = lib.allocHandle();
    b.buttonInit(btn);
    cleanups.push(() => b.buttonDrop(btn));
    b.buttonSetLabel(btn, lib.encodeString(button.label));
    b.buttonSetUrl(btn, lib.encodeString(button.url));
    b.addButton(handle, btn);
  }

  return () => {
    for (const drop of cleanups) drop();
  };
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
  const dropSubs = applyActivity(client.lib, b, handle, activity);
  try {
    await dispatchPresence(
      client,
      b,
      handle,
      options.timeoutMs ?? DEFAULT_PRESENCE_TIMEOUT_MS
    );
  } finally {
    dropSubs();
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
