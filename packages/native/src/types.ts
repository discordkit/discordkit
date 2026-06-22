/**
 * Shared enums and value types mirroring `cdiscord.h`. Kept dependency-free and
 * tiny so importing them costs nothing — they carry no FFI bindings.
 */

/**
 * Connection status of a client, exposed as the public string form. Mirrors
 * `Discord_Client_Status` (numeric in the ABI; we surface readable strings).
 * camelCase, consistent with every other public enum in the package.
 */
export type Status =
  | `disconnected`
  | `connecting`
  | `connected`
  | `ready`
  | `reconnecting`
  | `disconnecting`
  | `httpWait`;

/** Maps the ABI's numeric `Discord_Client_Status` to the public string form. */
export const STATUS_BY_CODE: Record<number, Status> = {
  0: `disconnected`,
  1: `connecting`,
  2: `connected`,
  3: `ready`,
  4: `reconnecting`,
  5: `disconnecting`,
  6: `httpWait`
};

/** Log severity, public string form. Mirrors `Discord_LoggingSeverity`. */
export type LogSeverity = `verbose` | `info` | `warning` | `error` | `none`;

/** ABI numeric values for `Discord_LoggingSeverity` (the `X_CODE` forward map). */
export const LOG_SEVERITY_CODE: Record<LogSeverity, number> = {
  verbose: 1,
  info: 2,
  warning: 3,
  error: 4,
  none: 5
};

/** Maps the ABI's numeric `Discord_LoggingSeverity` to the public string form. */
export const LOG_SEVERITY_BY_CODE: Record<number, LogSeverity> = {
  1: `verbose`,
  2: `info`,
  3: `warning`,
  4: `error`,
  5: `none`
};

/** A log line delivered to {@link onLog} subscribers. */
export interface LogEntry {
  message: string;
  severity: LogSeverity;
}

/** The kind of OAuth2 token, the public form of `Discord_AuthorizationTokenType`. */
export type AuthorizationTokenType = `user` | `bearer`;

/** ABI numeric values for `Discord_AuthorizationTokenType` (the `X_CODE` map). */
export const AUTHORIZATION_TOKEN_TYPE_CODE: Record<
  AuthorizationTokenType,
  number
> = {
  user: 0,
  bearer: 1
};
