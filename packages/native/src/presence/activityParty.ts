import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::ActivityParty` (`Discord_ActivityParty_*`). The `id` is a `Discord_String` by value; sizes are `int32_t`.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_ActivityParty_Init(void *self)`,
  drop: /* C */ `void Discord_ActivityParty_Drop(void *self)`,
  setId: /* C */ `void Discord_ActivityParty_SetId(void *self, Discord_String value)`,
  setCurrentSize: /* C */ `void Discord_ActivityParty_SetCurrentSize(void *self, int32_t value)`,
  setMaxSize: /* C */ `void Discord_ActivityParty_SetMaxSize(void *self, int32_t value)`
});

/** Party info — renders as "(current of max)" next to the state. Discord REQUIRES an `id` (2–128 chars) when a party is present. */
export interface ActivityParty {
  id?: string;
  currentSize?: number;
  maxSize?: number;
}

/**
 * Build an initialized `ActivityParty` handle, or `undefined` when no `id` is supplied — Discord requires a party id (2–128 chars) when a party is present, so sizes alone are rejected. Caller attaches via `Discord_Activity_SetParty` and `drop()`s after copy.
 */
export const buildParty = (
  lib: FfiLibrary,
  party: ActivityParty
): SubObjectHandle | undefined => {
  if (!party.id) return undefined;
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  b.setId(handle, lib.encodeString(party.id));
  if (party.currentSize !== undefined) {
    b.setCurrentSize(handle, party.currentSize);
  }
  if (party.maxSize !== undefined) b.setMaxSize(handle, party.maxSize);
  return subObjectHandle(handle, () => b.drop(handle));
};
