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
// A span OUT-param: `{ T* ptr; size_t size }`. The SDK writes a pointer to a
// contiguous array of inline element handles + a count. We only need the two
// fields generically — elements are all structurally `Discord_Handle`. The same
// struct also fits `Discord_UInt64Span` (`{ uint64_t* ptr; size_t size }`) — two
// machine words either way — so `allocSpanOut` backs both readers.
koffi.struct(`Discord_Span`, { ptr: `void *`, size: `size_t` });
// A `Discord_Properties` map: parallel key/value Discord_String arrays + count.
koffi.struct(`Discord_Properties`, {
  size: `size_t`,
  keys: `Discord_String *`,
  values: `Discord_String *`
});

/** Size (bytes) of one inline handle element in a span — a single `void*`. */
const HANDLE_SIZE = 8;
/** Size (bytes) of one `uint64_t` element in a `Discord_UInt64Span`. */
const UINT64_SIZE = 8;
/** Size (bytes) of one inline `Discord_String` element (`{ ptr, size }`). */
const STRING_SIZE = 16;

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
    allocSpanOut: () => koffi.alloc(`Discord_Span`, 1),
    readSpan: (span) => {
      // Decode the {ptr,size} the SDK wrote. koffi represents pointers as
      // bigints, so element i (inline handle structs, contiguous) is at
      // base + i*HANDLE_SIZE — plain bigint arithmetic. Each element pointer is
      // a `void*` the element type's getters accept (same as allocHandle()).
      const { ptr, size } = koffi.decode(span, `Discord_Span`) as {
        ptr: bigint | null;
        size: number | bigint;
      };
      const count = Number(size);
      if (!ptr || count === 0) return [];
      const base = BigInt(ptr);
      return Array.from(
        { length: count },
        (_, i) => base + BigInt(i * HANDLE_SIZE)
      );
    },
    readUInt64Span: (span) => {
      // Same {ptr,size} layout as readSpan, but elements are raw uint64 VALUES,
      // not pointers to handles — decode each in place rather than returning a
      // pointer. koffi.decode(addr, type) reads from an address (a bigint).
      const { ptr, size } = koffi.decode(span, `Discord_Span`) as {
        ptr: bigint | null;
        size: number | bigint;
      };
      const count = Number(size);
      if (!ptr || count === 0) return [];
      const base = BigInt(ptr);
      return Array.from({ length: count }, (_, i) =>
        BigInt(
          koffi.decode(base + BigInt(i * UINT64_SIZE), `uint64_t`) as bigint
        )
      );
    },
    allocPropertiesOut: () => koffi.alloc(`Discord_Properties`, 1),
    allocUInt64Out: () => koffi.alloc(`uint64_t`, 1),
    readUInt64Out: (out) => BigInt(koffi.decode(out, `uint64_t`) as bigint),
    readProperties: (out) => {
      // Decode the {size, keys*, values*} the SDK wrote; keys/values are parallel
      // arrays of inline Discord_String structs. Read element i from each by
      // bigint offset, decode its bytes, and pair them up.
      const { size, keys, values } = koffi.decode(
        out,
        `Discord_Properties`
      ) as {
        size: number | bigint;
        keys: bigint | null;
        values: bigint | null;
      };
      const count = Number(size);
      if (!keys || !values || count === 0) return {};
      const keyBase = BigInt(keys);
      const valBase = BigInt(values);
      const readAt = (base: bigint, i: number): string =>
        readDiscordString(
          koffi.decode(base + BigInt(i * STRING_SIZE), `Discord_String`) as {
            ptr: unknown;
            size: number | bigint;
          }
        );
      const result: Record<string, string> = {};
      for (let i = 0; i < count; i++)
        result[readAt(keyBase, i)] = readAt(valBase, i);
      return result;
    },
    encodeProperties: (value) => {
      // Build parallel Discord_String arrays for keys + values and a Properties
      // struct pointing at them. The encoded buffers must stay reachable for the
      // call; the SDK copies synchronously, so returning the struct pointer (which
      // koffi keeps referencing the arrays) suffices.
      const entries = Object.entries(value);
      const toStringArray = (strings: string[]): unknown => {
        const buf = koffi.alloc(`Discord_String`, Math.max(entries.length, 1));
        strings.forEach((s, i) =>
          koffi.encode(buf, i * STRING_SIZE, `Discord_String`, encodeString(s))
        );
        return buf;
      };
      const ptr = koffi.alloc(`Discord_Properties`, 1);
      koffi.encode(ptr, `Discord_Properties`, {
        size: entries.length,
        keys: toStringArray(entries.map(([k]) => k)),
        values: toStringArray(entries.map(([, v]) => v))
      });
      return ptr;
    },
    decodeString,
    encodeStringPtr,
    encodeString
  };
};
