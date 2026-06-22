/**
 * The keyring relay contract — the reverse-RPC channel that lets the SIDECAR's
 * token store reach the OS credential vault, which only the webview/shell can
 * touch (via `tauri-plugin-keyring`).
 *
 * Unlike every other channel (webview → sidecar request/reply, sidecar → webview
 * events), this runs sidecar → webview request/reply: the sidecar's `TokenStore`
 * calls these on the webview's exposed local API, the webview answers by invoking
 * the keyring plugin, and the result comes back to the sidecar. So token storage
 * lives in the shell (true OS vault) while `@discordkit/native` still owns the
 * session lifecycle. Opt-in on both halves (see `@discordkit/tauri/keyring`) so
 * the plugin is only bundled when used.
 */

/** Reverse-RPC method names the webview exposes for the sidecar to call. */
export const KEYRING_CHANNELS = {
  get: `discordkit:keyring:get`,
  set: `discordkit:keyring:set`,
  delete: `discordkit:keyring:delete`
} as const;

/**
 * The keyring operations the webview exposes to the sidecar. String values only
 * (the sidecar serializes its `StoredTokens` to JSON before storing). `get`
 * resolves `null` when there's no stored entry.
 *
 * A `type` with the channel keys (not an `interface`) so it's assignable to the
 * `Record<string, fn>` the bridge's `expose` option expects — interfaces lack the
 * implicit string index signature that comparison needs.
 */
// eslint-disable-next-line consistent-type-definitions -- must be a `type` for Record assignability (see above)
export type KeyringRelay = {
  [KEYRING_CHANNELS.get]: (account: string) => Promise<string | null>;
  [KEYRING_CHANNELS.set]: (account: string, value: string) => Promise<void>;
  [KEYRING_CHANNELS.delete]: (account: string) => Promise<void>;
};
