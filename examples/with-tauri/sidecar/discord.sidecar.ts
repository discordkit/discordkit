/* oxlint-disable import/first --
   `./koffi-path.js` MUST be imported first — it sets process.resourcesPath before
   koffi's module evaluates (koffi loads its native addon eagerly at import time).
   The import-order rule wants absolute imports first, but correctness requires the
   side-effect import to lead, so the rule is disabled for this entry file. */
import "./koffi-path.js";
import { createSidecar } from "@discordkit/tauri/sidecar";
import { registerUsers } from "@discordkit/tauri/sidecar/users";
import { registerRelationships } from "@discordkit/tauri/sidecar/relationships";
import { tauriKeyringStore } from "@discordkit/tauri/keyring";

/**
 * The Node sidecar that runs the Discord Social SDK for Friends List Studio.
 *
 * `vp pack` (Node SEA, see vite.config `pack.exe`) compiles this to a single
 * `discord-sidecar` executable that Tauri's shell plugin spawns; it speaks kkrpc
 * over stdio to the webview (the `createClient` half in `src/discord.ts`).
 *
 * We compose only the domains the Studio uses — **users + relationships** — so the
 * binary bundles exactly that native surface and nothing else (the per-domain
 * tree-shaking boundary; voice/lobbies/messaging native code never ships here).
 *
 * Config comes from the environment the Tauri shell passes through:
 * - `DISCORD_APPLICATION_ID` — the app's public Discord Application ID (PKCE
 *   public client; no client secret).
 * - `DISCORD_SDK_PATH` — optional path to the Social SDK library; when unset,
 *   `@discordkit/native` probes conventional locations.
 *
 * `tokenStore` is the OS-keychain backend (`tauriKeyringStore`): the player
 * authorizes through the browser ONCE — later launches reconnect silently from the
 * stored refresh token (native handles persistence + refresh; see startSession).
 * The keychain bytes live in the shell's OS vault (Credential Manager / Keychain /
 * Secret Service); the store reaches it over the bridge via the webview's
 * `keyringRelay` (see src/discord.ts), so a Node SEA sidecar needs no native addon
 * of its own.
 *
 * stdout carries the RPC protocol, so this process must never `console.log`;
 * diagnostics go to stderr (createSidecar's default).
 */
const applicationId = process.env.DISCORD_APPLICATION_ID;
if (!applicationId) {
  process.stderr.write(
    `discord-sidecar: DISCORD_APPLICATION_ID is not set. Put your Discord ` +
      `Application ID in the app's .env (see .env.schema) — the friends list ` +
      `can't authenticate without it.\n`
  );
}

createSidecar([registerUsers, registerRelationships], {
  applicationId,
  libraryPath: process.env.DISCORD_SDK_PATH,
  // Tokens persist in the OS vault via the webview's keyringRelay (see
  // src/discord.ts); createSidecar binds the store's transport on connect.
  tokenStore: tauriKeyringStore()
});
