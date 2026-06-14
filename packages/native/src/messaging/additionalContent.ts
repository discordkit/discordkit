import { defineBindings } from "../ffi/bindings.js";
import type { FfiLibrary, FfiOpaque } from "../ffi/backend.js";
import {
  ADDITIONAL_CONTENT_TYPE_BY_CODE,
  type AdditionalContent
} from "./types.js";

/**
 * Bindings + snapshot reader for `discordpp::AdditionalContent` — the "unrenderable content" notice (images, polls, threads, …) on a message. Read-only value → plain {@link AdditionalContent} snapshot. `Title` is a bool-gated optional string (only set for polls/threads).
 */
const bindings = defineBindings({
  type: /* C */ `int Discord_AdditionalContent_Type(void *self)`,
  count: /* C */ `uint8_t Discord_AdditionalContent_Count(void *self)`,
  title: /* C */ `bool Discord_AdditionalContent_Title(void *self, Discord_String *returnValue)`
});

/** Read a native `AdditionalContent` into a plain {@link AdditionalContent} snapshot. */
export const readAdditionalContent = (
  lib: FfiLibrary,
  handle: FfiOpaque
): AdditionalContent => {
  const b = bindings(lib);
  const titleOut = lib.allocStringOut();
  const title = b.title(handle, titleOut)
    ? lib.decodeString(titleOut)
    : undefined;
  return {
    type: ADDITIONAL_CONTENT_TYPE_BY_CODE[Number(b.type(handle))] ?? `other`,
    count: Number(b.count(handle)),
    ...(title !== undefined ? { title } : {})
  };
};
