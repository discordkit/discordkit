import { ERROR_TYPE, ResultError } from "../ffi/bindings.js";

/**
 * Why an authorize/refresh attempt failed, in terms a UI can act on:
 * - `timeout` — the local Discord client never responded (it isn't running, or is unreachable); prompt the user to start Discord and retry.
 * - `declined` — the user cancelled/denied the authorization prompt in Discord.
 * - `failed` — any other failure (token exchange, network, validation, …).
 */
export type AuthorizeErrorReason = `timeout` | `declined` | `failed`;

/** A typed auth failure carrying a {@link AuthorizeErrorReason} for UI branching. */
export class AuthorizeError extends Error {
  readonly reason: AuthorizeErrorReason;
  constructor(reason: AuthorizeErrorReason, message: string) {
    super(message);
    this.name = `AuthorizeError`;
    this.reason = reason;
  }
}

/** Map a raw SDK {@link ResultError} (or any error) to a typed {@link AuthorizeError}. */
export const toAuthorizeError = (error: unknown): AuthorizeError => {
  if (error instanceof AuthorizeError) return error;
  if (error instanceof ResultError) {
    if (error.timedOut || error.errorType === ERROR_TYPE.clientNotReady) {
      return new AuthorizeError(`timeout`, error.message);
    }
    // The user cancelling the prompt surfaces two ways: a `Aborted` error type
    // (e.g. closing the window) or — when they click Deny — a generic RPC error
    // carrying the OAuth2 `access_denied` code. Treat both as "declined".
    if (
      error.errorType === ERROR_TYPE.aborted ||
      error.message.includes(`access_denied`)
    ) {
      return new AuthorizeError(`declined`, error.message);
    }
    return new AuthorizeError(`failed`, error.message);
  }
  return new AuthorizeError(
    `failed`,
    error instanceof Error ? error.message : String(error)
  );
};
