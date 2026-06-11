import type { OAuth2Scope } from "./OAuth2Scope.js";

/**
 * The response from `GET /oauth2/@me`, normalized to `camelCase`.
 *
 * `application` and `user` are typed structurally rather than pulling in the
 * full schemas from `@discordkit/client` — that would couple this package to
 * the client and its Valibot dependency. The shapes here cover the fields
 * `/oauth2/@me` actually returns; cast to `@discordkit/client`'s `Application`
 * / `User` types at the call site if you want the complete object typings.
 */
export interface AuthorizationInfo {
  /** Partial application the token was issued for. */
  application: AuthorizedApplication;
  /** The scopes the user has authorized the application for. */
  scopes: OAuth2Scope[];
  /** When the access token expires, as an ISO 8601 timestamp. */
  expires: string;
  /** The authorizing user — present only if the `identify` scope was granted. */
  user?: AuthorizedUser;
}

/** The partial application object embedded in {@link AuthorizationInfo}. */
export interface AuthorizedApplication {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  /** Allow extra fields Discord may include without widening every consumer. */
  [key: string]: unknown;
}

/** The partial user object embedded in {@link AuthorizationInfo}. */
export interface AuthorizedUser {
  id: string;
  username: string;
  discriminator: string;
  /** The user's avatar hash, or `null` if they use a default avatar. */
  avatar: string | null;
  /** The user's email — present only if the `email` scope was granted. */
  email?: string | null;
  [key: string]: unknown;
}
