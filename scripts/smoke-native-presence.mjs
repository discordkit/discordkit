/**
 * Real-SDK presence smoke for @discordkit/native.
 *
 * Loads the REAL Discord Social SDK through the built package (Koffi backend)
 * and exercises the presence marshaling path end-to-end — what the mock-backend
 * contract tests can't cover: that Koffi marshals our `Discord_String` /
 * opaque-handle / callback shapes correctly across the real C ABI.
 *
 * It does NOT do OAuth (no browser), so presence won't actually display; we're
 * confirming the calls round-trip cleanly. Local/maintainer-driven — the SDK
 * binary can't be redistributed, so this never runs in untrusted CI.
 *
 * Prereqs:
 *   - `vp pack` in packages/native (build dist)
 *   - DISCORD_SDK_PATH pointing at the extracted SDK (defaults to the vendor dir)
 *
 * Run:
 *   DISCORD_SDK_PATH=./vendor/discord-social-sdk/1.9.16441 \
 *     node scripts/smoke-native-presence.mjs
 */

import { createClient } from "../packages/native/dist/index.mjs";
import {
  setActivity,
  clearActivity
} from "../packages/native/dist/presence.mjs";

const APP_ID = process.env.DISCORD_APPLICATION_ID ?? `1349146942634065960`;

// The UpdateRichPresence ack is connection-gated, so we only need to prove the
// call MARSHALS without crashing — time-box the await.
const timeBox = async (p, label) => {
  const acked = (async () => {
    await p;
    return `acked`;
  })();
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      resolve(`dispatched (ack pending — not connected)`);
    }, 1500);
  });
  const outcome = await Promise.race([acked, timeout]);
  console.log(`✓ ${label}: ${outcome}`);
};

console.log(`Creating client against the real SDK …`);
const client = createClient({ applicationId: APP_ID });
console.log(`✓ client created; status:`, client.status.get());

using _log = client.onLog(({ severity, message }) =>
  console.log(`  [${severity}] ${message}`)
);

try {
  console.log(`Setting activity (object form) …`);
  await timeBox(
    setActivity(
      {
        type: `playing`,
        state: `Smoke test`,
        details: `via @discordkit/native`
      },
      { client }
    ),
    `setActivity (object)`
  );

  console.log(`Setting activity (builder form) …`);
  await timeBox(
    setActivity(
      (a) => {
        a.type = `competing`;
        a.state = `builder form`;
      },
      { client }
    ),
    `setActivity (builder)`
  );

  console.log(`Clearing activity …`);
  await timeBox(clearActivity({ client }), `clearActivity`);

  console.log(
    `\n✅ SUCCESS: presence marshaling round-trips against the real SDK without error.`
  );
} catch (err) {
  console.error(`\n❌ FAILED:`, err);
  process.exitCode = 1;
} finally {
  client.close();
  console.log(`✓ client closed.`);
}
