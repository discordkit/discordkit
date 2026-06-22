import {
  defineBindings,
  subObjectHandle,
  type SubObjectHandle
} from "../ffi/bindings.js";
import type { FfiLibrary } from "../ffi/backend.js";

/**
 * Bindings for `discordpp::ActivityAssets` — the images + hover text shown on a rich-presence card (`Discord_ActivityAssets_*`). All image/text/url fields take `Discord_String*` (a nullable pointer; use `encodeStringPtr`). Built and attached internally by `applyActivity`; not a standalone public surface.
 */
const bindings = defineBindings({
  init: /* C */ `void Discord_ActivityAssets_Init(void *self)`,
  drop: /* C */ `void Discord_ActivityAssets_Drop(void *self)`,
  setLargeImage: /* C */ `void Discord_ActivityAssets_SetLargeImage(void *self, Discord_String *value)`,
  setLargeText: /* C */ `void Discord_ActivityAssets_SetLargeText(void *self, Discord_String *value)`,
  setLargeUrl: /* C */ `void Discord_ActivityAssets_SetLargeUrl(void *self, Discord_String *value)`,
  setSmallImage: /* C */ `void Discord_ActivityAssets_SetSmallImage(void *self, Discord_String *value)`,
  setSmallText: /* C */ `void Discord_ActivityAssets_SetSmallText(void *self, Discord_String *value)`,
  setSmallUrl: /* C */ `void Discord_ActivityAssets_SetSmallUrl(void *self, Discord_String *value)`
});

/** Art assets shown on the activity card (`discordpp::ActivityAssets`). Image fields are **asset keys** uploaded under the app's Rich Presence → Art Assets (or external image URLs, where supported). */
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

/**
 * Build an initialized `ActivityAssets` handle from {@link ActivityAssets}, or `undefined` when no field is set. Skips EMPTY strings (the SDK rejects empty length-constrained fields). Returns a {@link SubObjectHandle}: the caller attaches `.handle` via `Discord_Activity_SetAssets`, then `using` disposes it (drops the native handle) once the SDK has copied the activity.
 */
export const buildAssets = (
  lib: FfiLibrary,
  assets: ActivityAssets
): SubObjectHandle | undefined => {
  if (!Object.values(assets).some(Boolean)) return undefined;
  const b = bindings(lib);
  const handle = lib.allocHandle();
  b.init(handle);
  const { largeImage, largeText, largeUrl, smallImage, smallText, smallUrl } =
    assets;
  if (largeImage) b.setLargeImage(handle, lib.encodeStringPtr(largeImage));
  if (largeText) b.setLargeText(handle, lib.encodeStringPtr(largeText));
  if (largeUrl) b.setLargeUrl(handle, lib.encodeStringPtr(largeUrl));
  if (smallImage) b.setSmallImage(handle, lib.encodeStringPtr(smallImage));
  if (smallText) b.setSmallText(handle, lib.encodeStringPtr(smallText));
  if (smallUrl) b.setSmallUrl(handle, lib.encodeStringPtr(smallUrl));
  return subObjectHandle(handle, () => b.drop(handle));
};
