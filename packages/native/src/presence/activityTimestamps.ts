import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::ActivityTimestamps` (`Discord_ActivityTimestamps_*`). Start/end are `uint64_t` by value, Unix epoch **milliseconds**.
 */
const bindings = defineBindings({
  init: `void Discord_ActivityTimestamps_Init(void *self)`,
  drop: `void Discord_ActivityTimestamps_Drop(void *self)`,
  setStart: `void Discord_ActivityTimestamps_SetStart(void *self, uint64_t value)`,
  setEnd: `void Discord_ActivityTimestamps_SetEnd(void *self, uint64_t value)`
});

/** Start/end of the activity, as Unix epoch **milliseconds**. A `start` renders "elapsed" (e.g. "02:34 elapsed"); an `end` renders "remaining". */
export interface ActivityTimestamps {
  start?: number;
  end?: number;
}

/**
 * Build an initialized `ActivityTimestamps` handle, or `undefined` when neither bound is set. Caller attaches via `Discord_Activity_SetTimestamps` and `drop()`s after copy.
 */
export const buildTimestamps = (
  lib: FfiLibrary,
  timestamps: ActivityTimestamps
): SubObjectHandle | undefined => {
  if (timestamps.start === undefined && timestamps.end === undefined) {
    return undefined;
  }
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  if (timestamps.start !== undefined) {
    b.setStart(handle, BigInt(timestamps.start));
  }
  if (timestamps.end !== undefined) b.setEnd(handle, BigInt(timestamps.end));
  return subObjectHandle(handle, () => b.drop(handle));
};
