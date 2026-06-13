/**
 * Shared enums and value types mirroring `cdiscord.h`. Kept dependency-free and
 * tiny so importing them costs nothing — they carry no FFI bindings.
 */

/**
 * Connection status of a client, exposed as the public string form. Mirrors
 * `Discord_Client_Status` (numeric in the ABI; we surface readable strings).
 */
export type Status =
  | `Disconnected`
  | `Connecting`
  | `Connected`
  | `Ready`
  | `Reconnecting`
  | `Disconnecting`
  | `HttpWait`;

/** Maps the ABI's numeric `Discord_Client_Status` to the public string form. */
export const STATUS_BY_CODE: Record<number, Status> = {
  0: `Disconnected`,
  1: `Connecting`,
  2: `Connected`,
  3: `Ready`,
  4: `Reconnecting`,
  5: `Disconnecting`,
  6: `HttpWait`
};

/** Log severity, public string form. Mirrors `Discord_LoggingSeverity`. */
export type LogSeverity = `Verbose` | `Info` | `Warning` | `Error` | `None`;

/** ABI numeric values for `Discord_LoggingSeverity`. */
export const LOG_SEVERITY: Record<LogSeverity, number> = {
  Verbose: 1,
  Info: 2,
  Warning: 3,
  Error: 4,
  None: 5
};

export const LOG_SEVERITY_BY_CODE: Record<number, LogSeverity> = {
  1: `Verbose`,
  2: `Info`,
  3: `Warning`,
  4: `Error`,
  5: `None`
};

/** A log line delivered to {@link onLog} subscribers. */
export interface LogEntry {
  message: string;
  severity: LogSeverity;
}

/** `Discord_AuthorizationTokenType`. */
export const AUTHORIZATION_TOKEN_TYPE = {
  User: 0,
  Bearer: 1
} as const;
