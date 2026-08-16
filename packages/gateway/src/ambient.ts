import { GatewayConnection, type ConnectionConfig } from "./connection.js";

/**
 * The ambient singleton connection. Mirrors `@discordkit/native`'s ambient
 * client (and, through it, the REST client's `discord` session): event
 * subscriptions read it via {@link useConnection} so call sites never thread a
 * connection around.
 *
 * Activation is two-path, deliberately: {@link configure} stores config with no
 * side effects (safe at module scope — importing this package must never open a
 * socket), while {@link connect} opens it. Subscribing does **not** activate:
 * unlike a REST fetcher, a subscription is meaningless until a socket exists,
 * and silently dialing Discord because someone imported a handler would be a
 * surprising side effect.
 *
 * Durable Objects should skip all of this and pass an explicit `connection` —
 * module-global state is per-isolate, so an ambient singleton is the wrong shape
 * when each DO instance owns its own socket.
 */
let storedConfig: ConnectionConfig | null = null;
let ambient: GatewayConnection | undefined;

/**
 * Store configuration for the ambient connection without opening it. Merge-
 * updates prior config. Safe to call at module scope.
 */
export const configure = (config: Partial<ConnectionConfig>): void => {
  storedConfig = { ...storedConfig, ...config } as ConnectionConfig;
};

/**
 * The ambient connection, created lazily from stored config on first use.
 *
 * @throws if no config has been provided — a Gateway connection can't be
 *   guessed from the environment the way a REST base URL can.
 */
export const useConnection = (): GatewayConnection => {
  if (ambient) return ambient;
  if (storedConfig === null) {
    throw new Error(
      `No ambient Gateway connection has been configured. Call configure({ token, intents }) before subscribing, or pass an explicit { connection } to this subscription.`
    );
  }
  ambient = new GatewayConnection(storedConfig);
  return ambient;
};

/**
 * Open the ambient connection, creating it from stored config if needed.
 * Optionally pass config (merged over any prior {@link configure}). Idempotent.
 */
export const connect = (
  config?: Partial<ConnectionConfig>
): GatewayConnection => {
  if (config) configure(config);
  const connection = useConnection();
  connection.connect();
  return connection;
};

/**
 * Close the ambient connection and discard it. Safe to call when inactive
 * (no-op). A later {@link connect} re-creates it from the stored config.
 */
export const disconnect = (): void => {
  ambient?.close();
  ambient = undefined;
};
