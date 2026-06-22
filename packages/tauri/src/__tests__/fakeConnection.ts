/**
 * An in-memory test harness that loops a real sidecar host to a real webview
 * client — the Tauri analogue of the Electron adapter's fake IPC. It exercises
 * the *actual* `buildSidecar` handlers + `createClient` bridge over the same
 * `SidecarConnection` seam the production wiring uses, just without kkrpc or a
 * spawned process:
 *
 * - the client's `call(channel, ...args)` invokes the sidecar's matching handler
 *   directly (request→reply), and
 * - the sidecar's `broadcast(channel, ...payload)` invokes the webview's exposed
 *   event sink (sidecar→webview events).
 *
 * Because both halves are the real code, a test that round-trips through this
 * harness verifies the bridge end to end — handler wiring, argument passing, and
 * the bidirectional event path — with the transport faithfully stubbed at the one
 * seam that the real kkrpc connection also plugs into.
 */

import {
  buildSidecar,
  type SidecarRegistrar,
  type SidecarOptions
} from "../sidecar.js";
import type { SidecarConnection } from "../client.js";
import { EVENT_SINK } from "../internal.js";

/** A booted fake harness: the connection to pass to `createClient`, plus controls. */
export interface FakeHarness {
  /** Pass as `createClient`'s second arg to drive the real sidecar in-memory. */
  connection: SidecarConnection;
  /**
   * Push an event the way the SDK would, so a test can exercise the event path
   * without the native stub firing real events. Routes to the webview's event
   * sink once a client has connected.
   */
  broadcast: (channel: string, ...payload: unknown[]) => void;
  /** Tear down the sidecar host (mirrors the real connection's `close`). */
  dispose: () => void;
}

/**
 * Boot a sidecar host with the given registrars + options (a stub backend, in
 * tests) and return a {@link SidecarConnection} that bridges it to a client.
 */
export const fakeConnection = (
  registrars: SidecarRegistrar[] = [],
  options: SidecarOptions = {}
): FakeHarness => {
  const host = buildSidecar(registrars, options);

  const connection: SidecarConnection = async (localApi) => {
    // The webview's event sink is the one method it exposes; wire the sidecar's
    // broadcast to call it, exactly as the real kkrpc reverse-proxy would.
    const sink = localApi[EVENT_SINK] as
      | ((channel: string, ...payload: unknown[]) => void)
      | undefined;
    host.setSink((channel, ...payload) => sink?.(channel, ...payload));

    // The remote API: each registered handler, wrapped so calls resolve as the
    // real proxy does (always a Promise).
    const remote = Object.fromEntries(
      Object.entries(host.handlers).map(([channel, handler]) => [
        channel,
        async (...args: unknown[]) => handler(...args)
      ])
    );

    return {
      remote,
      close: () => host.dispose()
    };
  };

  return { connection, broadcast: host.broadcast, dispose: host.dispose };
};
