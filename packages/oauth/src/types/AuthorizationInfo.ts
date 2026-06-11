import * as v from "valibot";
import { schema } from "@discordkit/core/validations/schema";

/**
 * The partial application object embedded in {@link AuthorizationInfo}.
 * `looseObject` so Discord's extra fields pass through (we only model the ones
 * `/oauth2/@me` is documented to return).
 */
const _authorizedApplicationSchema = v.looseObject({
  id: v.string(),
  name: v.string(),
  icon: v.nullable(v.string()),
  description: v.string()
});

export interface AuthorizedApplication extends v.InferOutput<
  typeof _authorizedApplicationSchema
> {}

export const authorizedApplicationSchema = schema<AuthorizedApplication>(
  _authorizedApplicationSchema
);

/** The partial user object embedded in {@link AuthorizationInfo}. */
const _authorizedUserSchema = v.looseObject({
  id: v.string(),
  username: v.string(),
  discriminator: v.string(),
  /** The user's avatar hash, or `null` if they use a default avatar. */
  avatar: v.nullable(v.string()),
  /** The user's email — present only if the `email` scope was granted. */
  email: v.exactOptional(v.nullable(v.string()))
});

export interface AuthorizedUser extends v.InferOutput<
  typeof _authorizedUserSchema
> {}

export const authorizedUserSchema = schema<AuthorizedUser>(
  _authorizedUserSchema
);

/**
 * Valibot schema for the `GET /oauth2/@me` response. Source of truth: the type
 * is inferred from it, `getCurrentAuthorizationInfo` validates Discord's
 * response against it, and the e2e mocks generate fixtures from it.
 */
const _authorizationInfoSchema = v.object({
  /** Partial application the token was issued for. */
  application: _authorizedApplicationSchema,
  /** The scopes the user has authorized the application for. */
  scopes: v.array(v.string()),
  /** When the access token expires, as an ISO 8601 timestamp. */
  expires: v.string(),
  /** The authorizing user — present only if the `identify` scope was granted. */
  user: v.exactOptional(_authorizedUserSchema)
});

/** The response from `GET /oauth2/@me`. */
export interface AuthorizationInfo extends v.InferOutput<
  typeof _authorizationInfoSchema
> {}

export const authorizationInfoSchema = schema<AuthorizationInfo>(
  _authorizationInfoSchema
);
