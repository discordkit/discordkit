/**
 * Koffi implementation of the {@link ./backend.ts | FFI backend seam}.
 *
 * node:ffi migration map (so the eventual swap is mechanical):
 *
 * | seam method        | koffi (here)                  | node:ffi equivalent                       |
 * | ------------------ | ----------------------------- | ----------------------------------------- |
 * | `func(decl)`       | `lib.func(decl)`              | `lib.getFunction(name, {arguments,return})` |
 * | `defineCallback`   | `koffi.proto(decl)`           | a `{arguments,return}` descriptor         |
 * | `registerCallback` | `koffi.register(fn, ptrType)` | `lib.registerCallback(desc, fn)`          |
 * | `unregisterCallback`| `koffi.unregister(h)`        | `lib.unregisterCallback(h)`               |
 * | `allocHandle`      | `koffi.alloc(struct, 1)`      | a pointer-sized Buffer                     |
 * | `decodeString`     | `koffi.decode(ptr, array)`    | `ffi.toBuffer(ptr, size, true)`           |
 */

import koffi, { type TypeObject } from "koffi";
import type { FfiBackend, FfiLibrary, DiscordStringValue } from "./backend.js";

/** Narrow an arbitrary backend value to the `Discord_String` `{ ptr, size }` shape. */
const isDiscordString = (
  value: unknown
): value is { ptr: unknown; size: number | bigint } =>
  typeof value === `object` &&
  value !== null &&
  `ptr` in value &&
  `size` in value &&
  Boolean((value as { ptr: unknown }).ptr);

// Register the value-struct types koffi must know to marshal them BY VALUE.
// Opaque handles passed by *pointer* don't need registration — feature
// declarations use `void *` for those. The exceptions are the few handles the
// SDK passes by value (e.g. `Discord_AuthorizationCodeChallenge` into
// `SetCodeChallenge`), plus `Discord_String` (ptr+size, crosses by value).
koffi.struct(`Discord_String`, { ptr: `uint8_t *`, size: `size_t` });
koffi.struct(`Discord_AuthorizationCodeChallenge`, { opaque: `void *` });
// Every SDK handle is structurally `{ void* opaque }`; we allocate this generic
// one and pass it through `void *` params, so the backend needs no per-handle
// type knowledge (`Discord_Client`, `Discord_Activity`, … are never registered).
koffi.struct(`Discord_Handle`, { opaque: `void *` });

const decodeString = (value: unknown): string => {
  if (!isDiscordString(value) || Number(value.size) === 0) return ``;
  const bytes = koffi.decode(
    value.ptr,
    koffi.array(`uint8_t`, Number(value.size))
  );
  return Buffer.from(bytes as number[]).toString(`utf8`);
};

const encodeString = (value: string): DiscordStringValue => {
  // koffi accepts a Node Buffer where a `uint8_t *` is expected; pair it with
  // the UTF-8 byte length for the `size` field of `Discord_String`.
  const buffer = Buffer.from(value, `utf8`);
  return { ptr: buffer, size: buffer.byteLength };
};

/** Open the SDK shared library and expose the seam primitives. */
export const koffiBackend: FfiBackend = (libraryPath: string): FfiLibrary => {
  const lib = koffi.load(libraryPath);
  return {
    func: (declaration) => lib.func(declaration),
    defineCallback: (declaration) => koffi.proto(declaration),
    // The seam types handles as opaque (`unknown`); these casts re-narrow them
    // to koffi's concrete types at the boundary. `type` is always a `koffi.proto`
    // result (a TypeObject) and `handle` is always a `koffi.register` result (a
    // bigint) — the asymmetry is intentional and lives only here.
    registerCallback: (type, fn) =>
      koffi.register(fn, koffi.pointer(type as TypeObject)),
    unregisterCallback: (handle) => {
      koffi.unregister(handle as bigint);
    },
    allocHandle: () => koffi.alloc(`Discord_Handle`, 1),
    decodeString,
    encodeString
  };
};
