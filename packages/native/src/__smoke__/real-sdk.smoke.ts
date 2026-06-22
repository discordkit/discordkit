import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
  // Activate ONCE for the whole suite. koffi's named-type registry (callback
  // protos like `OnStatusChanged`) is process-global and is NOT cleared by
  // shutdown(), so a second init() in the same process would re-register them
  // and throw "Duplicate type name". Real apps init once; the smoke does too.
  beforeAll(() => {
    init({ applicationId: `1234567890` });
  });
  // init() starts the callback pump; tear it down so Vitest can exit.
  afterAll(() => {
    shutdown();
  });

  it(`loads the library and activates the client without crashing`, () => {
    const client = useClient();
    expect(client.handle).toBeDefined();
    // Status is readable (Discord_Client_GetStatus + our enum mapping). It stays
    // `disconnected` — no Discord client on a CI runner — which is expected.
    expect(typeof client.status.get()).toBe(`string`);
  });

  it(`resolves + calls a representative op per domain (no connect needed)`, () => {
    // Each call exercises real Discord_* symbol resolution + the FFI marshaling
    // for that domain. Uncached/disconnected reads return empty — that's the
    // point: we assert the call SHAPE, not connected results. If any had hit a
    // renamed/removed symbol or a changed signature, koffi would have thrown.
    expect(getCurrentUser()).toBeUndefined(); // no current user before auth
    expect(getRelationships()).toEqual([]); // empty cache
    expect(getLobbyIds()).toEqual([]); // not in any lobby
  });
});
