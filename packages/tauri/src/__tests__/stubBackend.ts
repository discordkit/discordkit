/**
 * A minimal stub of `@discordkit/native`'s FFI backend — just enough for the
 * sidecar host (`buildSidecar`) to boot the native client and wire its RPC
 * handlers + event subscriptions WITHOUT the real SDK. The tauri bridge's job is
 * wiring; it doesn't need real native behavior to verify that every channel is
 * handled and that events broadcast.
 *
 * Native's own package exhaustively tests the real ops against its full mock
 * backend; reaching into that here would couple these tests to native's private
 * test scaffolding, so this local stub keeps the boundary at the adapter's edge.
 *
 * Typed structurally (not importing native's `FfiBackend`) so the dependency
 * stays one-directional; the host accepts it via `ClientConfig.backend`.
 */

/** The status-changed callback the stub captures so a test can drive the signal. */
let statusCallback: ((code: number, ...rest: unknown[]) => void) | undefined;

/** Fire the captured status callback (e.g. code 3 = "ready"). */
export const emitStatus = (code: number): void => {
  statusCallback?.(code);
};

const noop = (): undefined => undefined;

/** A no-op FFI library satisfying the native seam shape. */
export const stubBackend = (): unknown => {
  const registered = new Map<symbol, (...args: any[]) => void>();
  return {
    func: () => noop,
    defineCallback: (decl: string) => ({ __proto: decl }),
    registerCallback: (type: unknown, fn: (...args: any[]) => void) => {
      const key = Symbol(`cb`);
      registered.set(key, fn);
      const decl =
        typeof type === `object` && type && `__proto` in type
          ? String((type as { __proto: unknown }).__proto)
          : ``;
      if (decl.includes(`OnStatusChanged`)) statusCallback = fn;
      return key;
    },
    unregisterCallback: (h: unknown) => {
      registered.delete(h as symbol);
    },
    allocHandle: () => ({}),
    allocStringOut: () => ({}),
    allocSpanOut: () => ({ __span: [] }),
    readSpan: () => [],
    readUInt64Span: () => [],
    readProperties: () => ({}),
    allocPropertiesOut: () => ({}),
    allocUInt64Out: () => ({}),
    readUInt64Out: () => 0n,
    encodeProperties: (v: Record<string, string>) => v,
    decodeString: () => ``,
    encodeString: (v: string) => ({ ptr: v, size: v.length }),
    encodeStringPtr: (v: string) => ({ __str: v })
  };
};
