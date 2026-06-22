/* eslint-disable require-await --
   The relay methods are `async` to satisfy the async relay contract, but they
   pass the keyring plugin's invoke promise straight through, so there's no `await`
   in the body. */
import {
  getPassword,
  setPassword,
  deletePassword
} from "tauri-plugin-keyring-api";
import type { TokenStore, StoredTokens } from "@discordkit/native/auth";
import { KEYRING_CHANNELS, type KeyringRelay } from "./channels/keyring.js";

/**
 * OS-keychain token storage for the Tauri adapter — true OS-vault persistence
 * (Windows Credential Manager / macOS Keychain / Linux Secret Service) via
 * `tauri-plugin-keyring`, which only the webview/shell can reach. The sidecar's
 * session lifecycle (in `@discordkit/native`) drives storage over a reverse RPC:
 *
 * - **Webview**: {@link keyringRelay} exposes get/set/delete to the sidecar (it
 *   invokes the keyring plugin). Pass it to `createClient`'s `expose` option.
 * - **Sidecar**: {@link tauriKeyringStore} is the `TokenStore` you give
 *   `createSidecar`; its calls travel back to the webview's relay. `createSidecar`
 *   binds its transport once the bridge connects.
 *
 * Opt-in (separate subpath) so `tauri-plugin-keyring` is only bundled when used.
 * Prefer this over native's `fileStore` for production: hardware-backed vault
 * storage instead of an encrypted file.
 */

// --- webview side ------------------------------------------------------------

/**
 * Build the keyring relay the webview exposes to the sidecar. Answers the
 * sidecar's get/set/delete by invoking `tauri-plugin-keyring-api` against the OS
 * vault under `service` (the keychain service name). Pass the returned record as
 * `createClient`'s `expose` so the sidecar can call it.
 *
 * ```ts
 * const discord = await createClient([usersSlice, relationshipsSlice], {
 *   expose: keyringRelay("gg.example.my-app")
 * });
 * ```
 */
export const keyringRelay = (service: string): KeyringRelay => ({
  // `getPassword` resolves null (not throws) when the entry is absent.
  [KEYRING_CHANNELS.get]: async (account): Promise<string | null> =>
    getPassword(service, account),
  [KEYRING_CHANNELS.set]: async (account, value): Promise<void> =>
    setPassword(service, account, value),
  [KEYRING_CHANNELS.delete]: async (account): Promise<void> =>
    deletePassword(service, account)
});

// --- sidecar side ------------------------------------------------------------

/** The subset of the webview's remote API the keyring store calls. */
type KeyringRemote = KeyringRelay;

/**
 * A {@link TokenStore} that persists to the OS keychain by delegating to the
 * webview's {@link keyringRelay} over the bridge. `createSidecar` calls
 * `bindTransport` with the remote webview API once the kkrpc channel connects, so
 * construct it at config time without a transport in hand.
 *
 * @param account the keychain entry name for the token blob. Default
 *   `"discord-tokens"`.
 */
export const tauriKeyringStore = (
  account = `discord-tokens`
): TokenStore & { bindTransport: (remote: unknown) => void } => {
  let remote: KeyringRemote | undefined;
  const need = (): KeyringRemote => {
    if (!remote) {
      throw new Error(
        `The keyring token store isn't connected yet. createSidecar binds it on ` +
          `connect — ensure the webview exposes \`keyringRelay\` via createClient's ` +
          `\`expose\` option.`
      );
    }
    return remote;
  };
  return {
    bindTransport: (r) => {
      remote = r as KeyringRemote;
    },
    load: async () => {
      const raw = await need()[KEYRING_CHANNELS.get](account);
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as StoredTokens;
      } catch {
        return undefined;
      }
    },
    save: async (tokens: StoredTokens) => {
      await need()[KEYRING_CHANNELS.set](account, JSON.stringify(tokens));
    },
    clear: async () => {
      await need()[KEYRING_CHANNELS.delete](account);
    }
  };
};
