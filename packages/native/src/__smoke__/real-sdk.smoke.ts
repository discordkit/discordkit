import { describe, it, expect, afterEach } from "vitest";
import { init, shutdown, useClient } from "../ambient.js";
import { getCurrentUser } from "../users/users.js";
import { getRelationships } from "../relationships/relationships.js";
import { getLobbyIds } from "../lobby/lobbies.js";
import { resolveLibraryPath } from "../resolveLibrary.js";

/**
 * Real-SDK ABI smoke — loads the GENUINE Discord Social SDK binary (not the mock backend the unit suite uses) and verifies it loads, every `Discord_*` symbol our bindings declare resolves, and a representative op per domain can be CALLED without crashing at the FFI boundary.
 *
 * What it catches: **ABI drift on an SDK version bump** — a renamed/removed symbol or a changed signature surfaces here as a koffi load/call throw. What it does NOT verify: connected behavior. A CI runner has no Discord client, so these ops return empty/false (the SDK isn't connected) — that's fine; the point is symbol resolution + call-without-crash, not results. Full connected behavior stays local/maintainer-driven (see the example smokes).
 *
 * Gated on the binary being resolvable (`DISCORD_SDK_PATH` or a vendored lib), so it skips cleanly anywhere the SDK isn't present — including fork PRs, which never get the private-binary checkout. The `native` workflow runs it with the binary; everywhere else it's a no-op.
 *
 * This is a `.smoke.ts` file, which Vitest's default glob doesn't discover, so the standard `vp test` (the fork-safe unit suite) never runs it — only an explicit `vp test <this file>` does.
 */

const hasBinary = ((): boolean => {
  try {
    resolveLibraryPath();
    return true;
  } catch {
    return false;
  }
})();

describe.skipIf(!hasBinary)(`real Social SDK (genuine binary)`, () => {
  // init() starts the callback pump; always tear it down so Vitest can exit.
  afterEach(() => {
    shutdown();
  });

  it(`loads the library and activates the client without crashing`, () => {
    // Real backend (default), real binary — resolves Discord_Client_* symbols.
    const client = init({ applicationId: `1234567890` });
    expect(client.handle).toBeDefined();
    // Status is readable (Discord_Client_GetStatus + our enum mapping). It stays
    // `disconnected` — no Discord client on a CI runner — which is expected.
    expect(typeof client.status.get()).toBe(`string`);
  });

  it(`resolves + calls a representative op per domain (no connect needed)`, () => {
    init({ applicationId: `1234567890` });

    // Each call exercises real Discord_* symbol resolution + the FFI marshaling
    // for that domain. Uncached/disconnected reads return empty — that's the
    // point: we assert the call SHAPE, not connected results.
    expect(getCurrentUser()).toBeUndefined(); // no current user before auth
    expect(getRelationships()).toEqual([]); // empty cache
    expect(getLobbyIds()).toEqual([]); // not in any lobby

    // If any of the above had hit a renamed/removed symbol or a changed
    // signature, koffi would have thrown before reaching these assertions.
    expect(useClient().handle).toBeDefined();
  });
});
