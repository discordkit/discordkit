import {
  createClient,
  type ClientConfig,
  type DiscordClient
} from "./client.js";

/**
 * The ambient singleton client. Mirrors the REST client's module-singleton
 * (`@discordkit/core`'s `discord`): feature operations read it via
 * {@link useClient} so call sites never thread a handle around.
 *
 * Activation is two-path (per design): {@link configure} stores config with no
 * side effects; {@link init} eagerly activates (load + handle + pump); and the
 * first feature operation lazily activates from stored config if `init` was
 * skipped. A single idempotent {@link ensureActive} backs all three, so the
 * native handle and pump are created exactly once.
 */
let storedConfig: ClientConfig = {};
let ambient: DiscordClient | undefined;

/**
 * Store configuration for the ambient client without activating it (no library
 * load, no handle, no pump). Merge-updates prior config. Safe to call at module
 * scope. Returns nothing — pair with {@link init} or any feature op to activate.
 */
export const configure = (config: ClientConfig): void => {
  storedConfig = { ...storedConfig, ...config };
};

/** Idempotent: activate the ambient client if it isn't already. */
const ensureActive = (config?: ClientConfig): DiscordClient => {
  if (config) configure(config);
  ambient ??= createClient(storedConfig);
  return ambient;
};

/**
 * Eagerly activate the ambient client: resolve + load the library, create and
 * init the native handle, and start the pump. Optionally pass config (merged
 * over any prior {@link configure}). Idempotent — calling twice returns the same
 * client without re-initializing.
 */
export const init = (config?: ClientConfig): DiscordClient =>
  ensureActive(config);

/**
 * The ambient client, activating it lazily from stored config on first use.
 * Internal accessor that feature operations (`setActivity`, `authorize`, …)
 * call so they never take a handle argument.
 *
 * @throws if no config has been provided and none can be resolved from the
 *   environment/conventions (surfaced by {@link createClient}).
 */
export const useClient = (): DiscordClient => ensureActive();

/**
 * Tear down the ambient client: stop the pump, drop the native handle,
 * unregister callbacks. Safe to call when inactive (no-op). After shutdown, a
 * later feature op (or {@link init}) re-activates from the stored config.
 */
export const shutdown = (): void => {
  ambient?.close();
  ambient = undefined;
};
