// `DisposableStack` is a runtime global only on Node 24+; the package targets
// Node 22 (the oldest LTS), so install the es-shims polyfill (no-op when the
// global already exists). Side-effect import — must run before any `new
// DisposableStack()` below.
import "disposablestack/auto";
import { useClient } from "../ambient.js";
import type { DiscordClient } from "../client.js";
import { awaitResult, defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import { ACTIVITY_TYPE, activityBindings, createActivity, STATUS_DISPLAY_TYPE } from "./activity.js";
import { buildAssets } from "./activityAssets.js";
import { buildButton } from "./activityButton.js";
import { buildParty } from "./activityParty.js";
import { buildTimestamps } from "./activityTimestamps.js";
import type {
  ActivityBuilder,
  ActivityInput,
  PresenceOptions
} from "./types.js";

/**
 * Client-level rich-presence operations (`Discord_Client_UpdateRichPresence` / `Discord_Client_ClearRichPresence`) plus the {@link applyActivity} orchestration that assembles an `Activity` from the per-class sub-object builders. This is the module that ties presence together; the public `setActivity`/`clearActivity` live here too.
 */
const bindings = defineBindings({
  update: /* C */ `void Discord_Client_UpdateRichPresence(void *self, void *activity, void *cb, void *cbFree, void *cbUserData)`,
  // Fully REMOVES the presence (no activity) — synchronous, no callback. Distinct
  // from UpdateRichPresence(emptyActivity), which still shows "Playing <AppName>".
  clear: /* C */ `void Discord_Client_ClearRichPresence(void *self)`,
  updateCb: {
    callback: /* C */ `void UpdateRichPresenceCallback(void *result, void *userData)`
  }
});

/** Normalize either input form (object or builder callback) into a plain object. */
const toActivity = (
  input: ActivityInput | ((builder: ActivityBuilder) => void)
): ActivityInput => {
  if (typeof input !== `function`) return input;
  const builder: ActivityBuilder = { type: `playing` };
  input(builder);
  return builder;
};

/**
 * Build a native `Discord_Activity` from an {@link ActivityInput}, registering the activity handle and every sub-object onto `stack` so a single `stack.dispose()` (or `using`) drops them all — in reverse order, even on throw. Returns the activity handle (already populated + sub-objects attached), ready to hand to `UpdateRichPresence`. Skips EMPTY strings (the SDK rejects empty length-constrained fields); buttons are filtered (need label+url) and capped at 2 (Discord's limit).
 *
 * The handles MUST outlive the `UpdateRichPresence` call (the SDK copies the activity synchronously inside it), so the caller keeps `stack` alive across the dispatch and disposes it only after.
 */
const buildActivity = (
  lib: FfiLibrary,
  stack: DisposableStack,
  a: ActivityInput
): FfiOpaque => {
  const b = activityBindings(lib);
  const activity = stack.use(createActivity(lib));
  const handle = activity.handle;

  b.setType(handle, ACTIVITY_TYPE[a.type ?? `playing`]);
  if (a.name) b.setName(handle, lib.encodeString(a.name));
  if (a.state) b.setState(handle, lib.encodeStringPtr(a.state));
  if (a.stateUrl) b.setStateUrl(handle, lib.encodeStringPtr(a.stateUrl));
  if (a.details) b.setDetails(handle, lib.encodeStringPtr(a.details));
  if (a.detailsUrl) b.setDetailsUrl(handle, lib.encodeStringPtr(a.detailsUrl));

  const assets = a.assets && buildAssets(lib, a.assets);
  if (assets) b.setAssets(handle, stack.use(assets).handle);

  const timestamps = a.timestamps && buildTimestamps(lib, a.timestamps);
  if (timestamps) b.setTimestamps(handle, stack.use(timestamps).handle);

  const party = a.party && buildParty(lib, a.party);
  if (party) b.setParty(handle, stack.use(party).handle);

  for (const button of (a.buttons ?? [])
    .filter((x) => x.label && x.url)
    .slice(0, 2)) {
    b.addButton(handle, stack.use(buildButton(lib, button)).handle);
  }
  
  // statusDisplayType: accept either a known key or a numeric code. Validate
  // against the allowed set (0,1,2) and pass an int32 pointer, or NULL to clear.
  if (a.statusDisplayType === undefined) {
  } else if (a.statusDisplayType === null) {
    // null (explicit clear) => pass NULL pointer to native API
    b.setStatusDisplayType(handle, null);
  } else {
    // accept either number or string key
    let numeric: number;
    if (typeof a.statusDisplayType === "number") {
      numeric = Number(a.statusDisplayType);
      if (![0, 1, 2].includes(numeric)) {
        throw new TypeError(
          `statusDisplayType must be one of 0 (name), 1 (state), or 2 (details)`
        );
      }
    } else {
      const mapped = STATUS_DISPLAY_TYPE[a.statusDisplayType as keyof typeof STATUS_DISPLAY_TYPE];
      if (mapped === undefined) {
        throw new TypeError(
          `statusDisplayType must be one of "name", "state", or "details"`
        );
      }
      numeric = mapped;
    }
    // encode an int32 pointer and pass it; backend must implement encodeInt32Ptr.
    b.setStatusDisplayType(handle, lib.encodeInt32Ptr(numeric));
  }


  return handle;
};

/**
 * Set the user's rich presence. Accepts a plain object or a builder callback:
 *
 * ```ts
 * await setActivity({ type: "playing", state: "In Match", details: "Rank: Diamond II" });
 * await setActivity((a) => { a.type = "playing"; a.state = "In Match"; });
 * ```
 *
 * `UpdateRichPresence` replaces the current activity (it does not patch), so the input fully describes the next presence. Resolves when the SDK acknowledges; rejects (never hangs) if the local Discord client doesn't respond within `timeoutMs`.
 */
export const setActivity = async (
  input: ActivityInput | ((builder: ActivityBuilder) => void),
  options: PresenceOptions = {}
): Promise<void> => {
  const client = options.client ?? useClient();
  const b = bindings(client.lib);
  // The activity handle + all its sub-objects are stacked together; the stack
  // disposes them (reverse order, even on throw) once we're past the SDK's
  // synchronous copy inside UpdateRichPresence.
  using stack = new DisposableStack();
  const handle = buildActivity(client.lib, stack, toActivity(input));
  await awaitResult(
    client,
    b.updateCb,
    (ptr) => b.update(client.handle, handle, ptr, null, null),
    () => undefined,
    { timeoutMs: options.timeoutMs, label: `rich presence update` }
  );
};

/**
 * Fully clear the user's rich presence via `Discord_Client_ClearRichPresence`, which REMOVES the activity entirely — unlike updating with an empty activity, which still shows "Playing <AppName>" with the app icon. Synchronous on the SDK side (no ack callback).
 */
export const clearActivity = (options: PresenceOptions = {}): void => {
  const client = options.client ?? useClient();
  bindings(client.lib).clear(client.handle);
};
