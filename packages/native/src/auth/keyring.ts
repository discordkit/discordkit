/* eslint-disable require-await --
   The keyring backend's methods are `async` to satisfy the async `TokenStore`
   seam (other backends may be genuinely async, e.g. a network vault), but
   `@napi-rs/keyring`'s Entry API is synchronous, so the bodies have no `await`. */
import { Entry } from "@napi-rs/keyring";
import type { StoredTokens, TokenStore } from "./tokenStore.js";

/**
 * A {@link TokenStore} backed by the operating system's credential vault —
 * Windows Credential Manager, macOS Keychain, or the Linux Secret Service —
 * through `@napi-rs/keyring`, a single cross-platform package (prebuilt per-OS
 * addons, no per-platform adapter on our side). Tokens are encrypted at rest by
 * the OS; nothing is written in plaintext.
 *
 * Opt-in subpath (`@discordkit/native/auth/keyring`) so the core package stays free of
 * the native addon for consumers who supply their own {@link TokenStore}.
 *
 * ```ts
 * import { init } from "@discordkit/native";
 * import { keyringStore } from "@discordkit/native/auth/keyring";
 * init({ tokenStore: keyringStore("my-game") });
 * ```
 *
 * @param service a stable name identifying your app in the OS vault (the keychain
 *   "service"); pick something unique like your app/bundle id.
 * @param account the vault "account" entry within the service. Defaults to
 *   `"discord-tokens"`; override to keep multiple profiles separate.
 */
export const keyringStore = (
  service: string,
  account = `discord-tokens`
): TokenStore => {
  // `@napi-rs/keyring`'s Entry is synchronous; we wrap each call in a resolved
  // Promise to satisfy the async TokenStore seam (other backends may be truly
  // async, e.g. a network vault).
  const entry = new Entry(service, account);
  return {
    load: async () => {
      const raw = entry.getPassword();
      if (!raw) return undefined;
      try {
        return JSON.parse(raw) as StoredTokens;
      } catch {
        // Corrupt/legacy entry — treat as "nothing stored" so the flow re-auths.
        return undefined;
      }
    },
    save: async (tokens: StoredTokens) => {
      entry.setPassword(JSON.stringify(tokens));
    },
    clear: async () => {
      // `deletePassword` throws if there's no entry; ignore that case.
      try {
        entry.deletePassword();
      } catch {
        /* nothing stored */
      }
    }
  };
};
