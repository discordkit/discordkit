import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::ActivityButton` (`Discord_ActivityButton_*`). Label/url are `Discord_String` by value.
 *
 * > **Note:** Rich-presence buttons are only visible to *other* users viewing your profile — never on your own. Test with a second account.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_ActivityButton_Init(void *self)`,
  drop: /* C */ `void Discord_ActivityButton_Drop(void *self)`,
  setLabel: /* C */ `void Discord_ActivityButton_SetLabel(void *self, Discord_String value)`,
  setUrl: /* C */ `void Discord_ActivityButton_SetUrl(void *self, Discord_String value)`
});

/** A clickable button on the activity card. Discord shows at most two. */
export interface ActivityButton {
  label: string;
  url: string;
}

/**
 * Build an initialized `ActivityButton` handle for a single button. Caller adds it via `Discord_Activity_AddButton` and `drop()`s after copy. (Empty/over-limit filtering is the caller's concern — see `applyActivity`.)
 */
export const buildButton = (
  lib: FfiLibrary,
  button: ActivityButton
): SubObjectHandle => {
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  b.setLabel(handle, lib.encodeString(button.label));
  b.setUrl(handle, lib.encodeString(button.url));
  return subObjectHandle(handle, () => b.drop(handle));
};
