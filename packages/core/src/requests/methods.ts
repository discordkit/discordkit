import type { GenericSchema, GenericSchemaAsync, InferOutput } from "valibot";
import type { RequestParams } from "./addParams.js";
import { buildURL } from "./buildURL.js";
import type { RequestBody, RequestOptions } from "./request.js";
import { request } from "./request.js";

/**
 * Capability flags advertised by a {@link Fetcher}. Each flag describes a
 * property of the underlying Discord endpoint — not a per-call preference.
 *
 * The flags drive both the `options` argument the fetcher accepts and the
 * headers/auth the request layer emits at runtime.
 */
export interface FetcherCapabilities {
  /**
   * `true` if the Discord endpoint MUST be called without an `Authorization`
   * header. Forces callers to acknowledge the unauthenticated path via
   * `{ anonymous: true }` and tells the request layer to skip the session token.
   */
  readonly anonymous?: boolean;
  /**
   * `true` if the Discord endpoint accepts the `X-Audit-Log-Reason` header.
   * Allows callers to pass `{ reason: "…" }`; the header is URL-encoded and
   * attached by the request layer.
   */
  readonly auditLogReason?: boolean;
}

/**
 * The shape of the per-call `options` argument a {@link Fetcher} accepts,
 * derived from the endpoint's {@link FetcherCapabilities}.
 *
 * - When `anonymous: true` is declared on the capability, the option is
 *   *required* on every call. When omitted, `anonymous` is forbidden.
 * - When `auditLogReason: true` is declared, `reason` is permitted; otherwise
 *   it is forbidden.
 */
export type RequestOptionsFor<C extends FetcherCapabilities> =
  // `anonymous` slot
  (C extends { anonymous: true }
    ? { anonymous: true }
    : { anonymous?: never }) &
    // `reason` slot
    (C extends { auditLogReason: true }
      ? { reason?: string }
      : { reason?: never });

/**
 * Decide whether the per-call `options` argument is required or optional
 * based on whether any capability forces a value to be passed.
 */
type RequiresOptions<C extends FetcherCapabilities> = C extends {
  anonymous: true;
}
  ? true
  : false;

export type Fetcher<
  /** A schema to validate the input arguments of a fetch call */
  S extends GenericSchema | GenericSchemaAsync | null = null,
  /** The return value expected from the fetch call */
  R = void,
  /** Endpoint capabilities; shapes the `options` argument */
  // oxlint-disable-next-line typescript/no-empty-object-type
  C extends FetcherCapabilities = {}
> = S extends null
  ? RequiresOptions<C> extends true
    ? (options: RequestOptionsFor<C>) => Promise<R>
    : (options?: RequestOptionsFor<C>) => Promise<R>
  : RequiresOptions<C> extends true
    ? (
        config: InferOutput<NonNullable<S>>,
        options: RequestOptionsFor<C>
      ) => Promise<R>
    : (
        config: InferOutput<NonNullable<S>>,
        options?: RequestOptionsFor<C>
      ) => Promise<R>;

export const get = async <T>(
  url: string,
  params?: RequestParams,
  options?: RequestOptions
): Promise<T> => request(buildURL(url, params), `GET`, undefined, options);

export const post = async <T>(
  url: string,
  body?: RequestBody,
  options?: RequestOptions
): Promise<T> => request(buildURL(url), `POST`, body, options);

export const put = async <T>(
  url: string,
  body?: RequestBody,
  options?: RequestOptions
): Promise<T> => request(buildURL(url), `PUT`, body, options);

export const patch = async <T>(
  url: string,
  body?: RequestBody,
  options?: RequestOptions
): Promise<T> => request(buildURL(url), `PATCH`, body, options);

export const remove = async <T = void>(
  url: string,
  options?: RequestOptions
): Promise<T> => request(buildURL(url), `DELETE`, undefined, options);
