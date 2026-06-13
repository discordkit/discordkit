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

// `Discord_String` (ptr+size) is the one value-struct koffi must know: it
// crosses by value in callbacks, and we allocate it for string out-params.
koffi.struct(`Discord_String`, { ptr: `uint8_t *`, size: `size_t` });
// Every SDK handle is structurally `{ void* opaque }`; we allocate this generic
// one and pass it through `void *` params, so the backend needs no per-handle
// type knowledge (`Discord_Client`, `Discord_Activity`, … are never registered).
// All handle params/out-params are declared `void *`, so by-value handle structs
// (e.g. the old SetCodeChallenge mistake) never need registering.
koffi.struct(`Discord_Handle`, { opaque: `void *` });

/** Read the UTF-8 bytes of a `{ ptr, size }` Discord_String into a JS string. */
const readDiscordString = (s: {
  ptr: unknown;
  size: number | bigint;
}): string => {
  if (!s.ptr || Number(s.size) === 0) return ``;
  const bytes = koffi.decode(s.ptr, koffi.array(`uint8_t`, Number(s.size)));
  return Buffer.from(bytes as number[]).toString(`utf8`);
};

const decodeString = (value: unknown): string => {
  // Callback args arrive as an already-decoded `{ ptr, size }` struct…
  if (isDiscordString(value)) return readDiscordString(value);
  // …whereas an `allocStringOut()` buffer is a POINTER to a Discord_String the
  // SDK wrote into — decode the struct first, then read its bytes.
  if (value === null || value === undefined) return ``;
  const decoded = koffi.decode(value, `Discord_String`) as {
    ptr: unknown;
    size: number | bigint;
  };
  return readDiscordString(decoded);
};

const encodeString = (value: string): DiscordStringValue => {
  // koffi accepts a Node Buffer where a `uint8_t *` is expected; pair it with
  // the UTF-8 byte length for the `size` field of `Discord_String`.
  const buffer = Buffer.from(value, `utf8`);
  return { ptr: buffer, size: buffer.byteLength };
};

const encodeStringPtr = (value: string): unknown => {
  // For `Discord_String*` params: allocate a Discord_String, encode the value
  // into it, and return the pointer. koffi.encode writes the struct fields; the
  // Buffer must stay reachable — koffi keeps the encoded struct's references for
  // the call's duration, and the SDK copies the string synchronously.
  const ptr = koffi.alloc(`Discord_String`, 1);
  koffi.encode(ptr, `Discord_String`, encodeString(value));
  return ptr;
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
    allocStringOut: () => koffi.alloc(`Discord_String`, 1),
    decodeString,
    encodeStringPtr,
    encodeString
  };
};
