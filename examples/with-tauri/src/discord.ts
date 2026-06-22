import { createClient, type Client } from "@discordkit/tauri/client";
import { usersSlice } from "@discordkit/tauri/client/users";
import { relationshipsSlice } from "@discordkit/tauri/client/relationships";
import { keyringRelay } from "@discordkit/tauri/keyring";

/** Keychain service namespace for this app's stored Discord tokens. */
const KEYRING_SERVICE = `gg.saeris.discordkit.friends-list-studio`;

/**
 * The webview side of the Discord bridge for Friends List Studio.
 *
 * `createClient` spawns the sidecar (`discord-sidecar`, via tauri-plugin-shell) and returns a typed bridge. We compose exactly the domains the Studio uses — **users + relationships** — matching the sidecar entry (`discord.sidecar.ts`). The bridge is created once (lazy singleton) and shared across the UI.
 *
 * `expose: keyringRelay(...)` lets the sidecar's token store reach the OS credential vault (only the webview/shell can touch it) — the reverse half of the keyring path; the sidecar uses `tauriKeyringStore` (see discord.sidecar.ts).
 */
export type DiscordBridge = Client<
  [typeof usersSlice, typeof relationshipsSlice]
>;

let bridge: Promise<DiscordBridge> | undefined;

/** Get (or lazily establish) the shared bridge to the Discord sidecar. */
export const getDiscord = async (): Promise<DiscordBridge> => {
  bridge ??= createClient([usersSlice, relationshipsSlice], {
    expose: keyringRelay(KEYRING_SERVICE)
  });
  return bridge;
};

/**
 * Drop the cached bridge so the next {@link getDiscord} re-spawns the sidecar. Needed after a sidecar startup failure: the process is dead, so a retry must create a fresh client rather than reuse the broken one.
 */
export const resetDiscord = (): void => {
  bridge = undefined;
};
