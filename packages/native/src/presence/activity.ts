import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::Activity` itself (`Discord_Activity_*`) — the activity handle's lifecycle, its scalar/string setters, and the attach points for the sub-objects (assets/timestamps/party/buttons). The sub-object handles themselves are built by their own modules ({@link ./activityAssets.ts}, etc.); this module owns the Activity that holds them.
 *
 * Marshaling (verified against the real SDK): `type` is an int enum; `name` is a `Discord_String` by value; `state`/`details`/`*Url` are `Discord_String*` (pointer; use `encodeStringPtr`); sub-object attach + `AddButton` take the sub-handle pointer as `void*`.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_Activity_Init(void *self)`,
  drop: /* C */ `void Discord_Activity_Drop(void *self)`,
  setType: /* C */ `void Discord_Activity_SetType(void *self, int value)`,
  setName: /* C */ `void Discord_Activity_SetName(void *self, Discord_String value)`,
  setState: /* C */ `void Discord_Activity_SetState(void *self, Discord_String *value)`,
  setStateUrl: /* C */ `void Discord_Activity_SetStateUrl(void *self, Discord_String *value)`,
  setDetails: /* C */ `void Discord_Activity_SetDetails(void *self, Discord_String *value)`,
  setDetailsUrl: /* C */ `void Discord_Activity_SetDetailsUrl(void *self, Discord_String *value)`,
  setAssets: /* C */ `void Discord_Activity_SetAssets(void *self, void *value)`,
  setTimestamps: /* C */ `void Discord_Activity_SetTimestamps(void *self, void *value)`,
  setParty: /* C */ `void Discord_Activity_SetParty(void *self, void *value)`,
  addButton: /* C */ `void Discord_Activity_AddButton(void *self, void *button)`
});

/** Rich-presence activity type. Mirrors `discordpp::ActivityTypes`. */
export type ActivityType =
  | `playing`
  | `streaming`
  | `listening`
  | `watching`
  | `competing`;

/** ABI numeric values for the activity types we expose (`Discord_ActivityTypes`). */
export const ACTIVITY_TYPE: Record<ActivityType, number> = {
  playing: 0,
  streaming: 1,
  listening: 2,
  watching: 3,
  // 4 = CustomStatus (not settable via rich presence), 6 = HangStatus.
  competing: 5
};

/** Accessor for the `discordpp::Activity` bindings, bound lazily per library. */
export const activityBindings = (
  lib: FfiLibrary
): ReturnType<typeof bindings> => bindings(lib);

/** Allocate + initialize a fresh `Discord_Activity` handle as a {@link SubObjectHandle} (so it joins the same `using`/DisposableStack cleanup as its sub-objects). */
export const createActivity = (lib: FfiLibrary): SubObjectHandle => {
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  return subObjectHandle(handle, () => b.drop(handle));
};
