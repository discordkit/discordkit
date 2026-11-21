import { sleep } from "../utils/sleep.js";
import { redactToken } from "./DiscordAPIError.js";
import type { RequestMethod, RequestOptions } from "./request.js";

export const endpoint = "https://discord.com/api/v10/" as const;

/** Environment variable read when no token has been set explicitly. */
export const TOKEN_ENV_VAR = "DISCORD_BOT_TOKEN" as const;

/**
 * The bot token from the environment, already prefixed for the `Authorization`
 * header, or `null` when unavailable.
 *
 * Only bot tokens come from the environment: a bearer token belongs to one
 * user and arrives per-request, so `.env` holds the raw secret Discord issued
 * and each client formats it. `process` is absent on some runtimes (bare
 * Cloudflare Workers), so the lookup is guarded rather than read directly.
 */
export const tokenFromEnv = (): `Bot ${string}` | null => {
  if (typeof process === `undefined`) return null;
  const token = process.env[TOKEN_ENV_VAR];
  return token === undefined || token === `` ? null : `Bot ${token}`;
};

/**
 * Where a request falls in Discord's rate limits.
 * https://discord.com/developers/docs/topics/rate-limits
 */
interface Route {
  /**
   * The method and path, with ids, tokens and reaction emoji replaced by
   * placeholders: `GET /channels/:id/messages`. Discord gives every request on
   * one route the same `X-RateLimit-Bucket` hash.
   */
  key: string;
  /**
   * The top-level resource Discord counts on its own: the channel, guild, or
   * webhook (with its token) in the path. For an interaction callback it is the
   * interaction, so that no callback waits for another. Empty when there is none.
   */
  major: string;
  /**
   * `false` for interaction endpoints, which Discord does not count against
   * the global rate limit.
   */
  global: boolean;
}

const toRoute = (method: RequestMethod, resource: URL): Route => {
  const segments = resource.pathname
    .replace(/^\/api(?:\/v\d+)?/, ``)
    .split(`/`);
  const [, top = ``, id = ``, token = ``] = segments;
  // `/webhooks/{id}` alone is a bot-authorized route with no token.
  const hasToken =
    (top === `webhooks` || top === `interactions`) && segments.length > 3;
  if (hasToken) segments[3] = `:token`;

  const path = segments
    .join(`/`)
    // Every reaction route on a message shares one limit, whatever the emoji.
    // Without this, each emoji would get its own queue and they would race.
    // Taken from discord.js, which groups them the same way.
    .replace(/\/reactions\/.*/, `/reactions/:reaction`)
    .replace(/\/\d+(?=\/|$)/g, `/:id`);

  let major = ``;
  if (top === `channels` || top === `guilds` || top === `interactions`) {
    major = id;
  } else if (top === `webhooks`) {
    major = hasToken ? `${id}/${token}` : id;
  }

  return { key: `${method} ${path}`, major, global: top !== `interactions` };
};

interface QueuedRequest {
  resource: URL;
  method: RequestMethod;
  route: Route;
  body?: string | FormData | null;
  options?: RequestOptions;
  /**
   * The `Authorization` header value captured for this request at enqueue
   * time — a snapshot of {@link DiscordSession.setActiveToken} (falling back
   * to the session token). Travels with the request through retries so a
   * later `setActiveToken` by a concurrent caller can't change the auth used
   * for an already-sent request.
   */
  token?: `${`Bot` | `Bearer`} ${string}`;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  retryCount?: number; // Optional retry tracking
}

interface InvalidRequestTracker {
  count: number;
  windowStart: number; // Timestamp in ms
}

/**
 * A disposable handle scoping requests to a single user's token, returned by
 * {@link DiscordSession.asUser}. Use with `using` for automatic cleanup:
 *
 * ```ts
 * using user = discord.asUser(accessToken);
 * const me = await user.request(() => getCurrentUser());
 * ```
 */
export interface UserSession extends Disposable {
  /** Run `fn` with this user's token active; restores the previous token after. */
  request: <T>(fn: () => Promise<T>) => Promise<T>;
}

/** @internal */
export class DiscordSession {
  endpoint: string = endpoint;
  maxRetries: number = 5;
  #authToken: string | null = null;
  /**
   * The currently-active per-request token override. When set, requests
   * enqueued via {@link queueRequest} capture this value (instead of the
   * session token) for their `Authorization` header. Used to make user-scoped
   * (OAuth2 bearer) calls without permanently changing the session.
   */
  #activeToken: `${`Bot` | `Bearer`} ${string}` | null = null;

  // Rate limit tracking
  /** Route key → the bucket hash Discord last reported for that route. */
  #bucketHashes = new Map<string, string>();
  /**
   * `${bucket hash}:${major}` → epoch ms when that bucket resets. Holds only
   * buckets with no requests left.
   */
  #exhaustedBuckets = new Map<string, number>();
  #globalReset: number = 0; // Epoch ms when a global 429 cooldown ends
  /**
   * One queue per route and major parameter, keyed `${route.key} ${major}`.
   * A queue is in the map only while its processor runs.
   */
  #queues = new Map<string, QueuedRequest[]>();

  // Global rate limit: 50 requests per second
  #globalLimit = 50;
  #globalWindow = 1000; // 1 second in ms
  #globalRequestTimestamps: number[] = [];

  // Invalid request tracking: 10,000 per 10 minutes
  #invalidRequests: InvalidRequestTracker = {
    count: 0,
    windowStart: Date.now()
  };

  #invalidRequestLimit = 10000;
  #invalidRequestWindow = 10 * 60 * 1000; // 10 minutes in ms

  get ready(): boolean {
    return Boolean(this.#authToken ?? tokenFromEnv());
  }

  constructor(authToken?: `${`Bot` | `Bearer`} ${string}` | null) {
    if (authToken) {
      this.setToken(authToken);
    }
  }

  /**
   * Clears the current session details, then attempts to set
   * new session values
   */
  setToken = (token: `${`Bot` | `Bearer`} ${string}`): this => {
    this.#authToken = null;
    if (token.length === 0) {
      throw new Error(`Must provide a non-empty string to set Auth Token`);
    }
    if (!token.startsWith(`Bot `) && !token.startsWith(`Bearer `)) {
      throw new Error(
        `Token must begin with either "Bot " or "Bearer ", received: ${token}`
      );
    }
    this.#authToken = token;
    return this;
  };

  clearSession = (): this => {
    this.#authToken = null;
    this.#activeToken = null;
    this.#bucketHashes.clear();
    this.#exhaustedBuckets.clear();
    this.#globalReset = 0;
    // Empty each queue as well as the map: a running processor holds its own
    // reference to its queue, and would otherwise keep sending.
    for (const queue of this.#queues.values()) queue.length = 0;
    this.#queues.clear();
    this.#globalRequestTimestamps = [];
    this.#invalidRequests = {
      count: 0,
      windowStart: Date.now()
    };
    return this;
  };

  /** Clear the active per-request token; requests fall back to the session token. */
  clearActiveToken = (): this => {
    this.#activeToken = null;
    return this;
  };

  /**
   * Scope subsequent requests to a single user's OAuth2 access token.
   *
   * Pass the **bare** access token (no `Bearer ` prefix — it's added for you).
   * Returns a disposable handle whose `request()` method runs a callback with
   * the user's token active, so any discordkit fetcher called inside it
   * authenticates as that user instead of the bot session:
   *
   * ```ts
   * using user = discord.asUser(accessToken);
   * const guilds = await user.request(() => getCurrentUserGuilds({}));
   * // `using` disposes the handle at scope exit — even on throw — clearing
   * // the active token so it can't leak into a later request (important on
   * // reused serverless/warm instances).
   * ```
   *
   * Without `using`, call {@link clearActiveToken} yourself when done, or rely
   * on each `request()` restoring the previous token after it resolves.
   */
  asUser = (accessToken: string): UserSession => {
    const token = `Bearer ${accessToken}` as const;
    return {
      request: async <T>(fn: () => Promise<T>): Promise<T> => {
        const previous = this.#activeToken;
        this.#activeToken = token;
        try {
          // `fn` enqueues the request synchronously, capturing `token` onto the
          // QueuedRequest before the first await — so restoring below can't
          // affect the in-flight request's auth.
          return await fn();
        } finally {
          this.#activeToken = previous;
        }
      },
      [Symbol.dispose]: (): void => {
        this.#activeToken = null;
      }
    };
  };

  /**
   * Whether a request can authenticate right now — either an active
   * per-request token or a session token is set. Used by the request layer to
   * decide if it must fail early for lack of auth.
   */
  get hasAuth(): boolean {
    return (
      this.#activeToken !== null ||
      this.#authToken !== null ||
      tokenFromEnv() !== null
    );
  }

  getSession = (): string => {
    // Falls back to the environment so a bot needs no setup beyond `.env`,
    // matching @discordkit/gateway. An explicit token always wins, since a
    // process may act as several identities.
    const token = this.#authToken ?? tokenFromEnv();

    if (!token) {
      throw new Error(
        `No Discord token is set, so the request cannot be authorized. Call discord.setToken("Bot <token>"), or set ${TOKEN_ENV_VAR} in the environment.`
      );
    }

    return token;
  };

  /**
   * Queue a request to be processed with rate limiting
   */
  queueRequest = async (
    resource: URL,
    method: RequestMethod,
    body?: string | FormData | null,
    options?: RequestOptions
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const route = toRoute(method, resource);
      const request: QueuedRequest = {
        resource,
        method,
        route,
        body,
        options,
        // Snapshot the active token NOW, at enqueue time. Reading it here
        // (synchronously) rather than later in #executeRequest is what makes
        // concurrent per-user calls safe: a subsequent setActiveToken can't
        // retroactively change the auth for a request already in the queue.
        ...(this.#activeToken === null ? {} : { token: this.#activeToken }),
        resolve,
        reject
      };

      const key = `${route.key} ${route.major}`;
      const queue = this.#queues.get(key);
      if (queue) {
        // Its processor is running and will reach this request in turn.
        queue.push(request);
        return;
      }
      const fresh = [request];
      this.#queues.set(key, fresh);
      void this.#processQueue(key, fresh);
    });
  };

  /**
   * Send one queue's requests in order, one at a time. Queues for other
   * buckets run alongside it, so a slow or rate-limited bucket holds up only
   * its own requests.
   */
  #processQueue = async (
    key: string,
    queue: QueuedRequest[]
  ): Promise<void> => {
    while (queue.length > 0) {
      const request = queue[0];
      if (typeof request === `undefined`) break;

      // The request stays in the queue, and counts in getQueueSize(), until it
      // may be sent.
      await this.#awaitTurn(request.route);
      // clearSession() emptied the queue while this request waited.
      if (queue[0] !== request) continue;

      queue.shift();
      try {
        const response = await this.#executeRequest(request);
        request.resolve(response);
      } catch (error) {
        if (error instanceof Error) {
          request.reject(error);
        }
      }
    }

    // After clearSession(), a new queue may already hold this key.
    if (this.#queues.get(key) === queue) this.#queues.delete(key);
  };

  /**
   * Wait until a request on `route` may be sent, then claim its place in the
   * global one-second window.
   */
  #awaitTurn = async (route: Route): Promise<void> => {
    // Check if we're temporarily banned (invalid request limit)
    if (this.#isTemporarilyBanned()) {
      const waitTime =
        this.#invalidRequestWindow -
        (Date.now() - this.#invalidRequests.windowStart);
      console.warn(
        `Temporarily banned from Discord API. Waiting ${Math.ceil(waitTime / 1000)}s`
      );
      await sleep(waitTime);
      this.#resetInvalidRequestCounter();
    }

    for (
      let wait = this.#delayFor(route);
      wait > 0;
      wait = this.#delayFor(route)
    ) {
      await sleep(wait);
    }

    // Claimed in the same tick as the last check, with no await between, so
    // queues running side by side cannot all take the same free slot.
    if (route.global) this.#globalRequestTimestamps.push(Date.now());
  };

  /**
   * Milliseconds until a request on `route` may be sent: the latest of its
   * bucket's reset and, unless the route is exempt, the global limits.
   */
  #delayFor = (route: Route): number => {
    const now = Date.now();
    const hash = this.#bucketHashes.get(route.key);
    const bucketReset =
      hash === undefined
        ? 0
        : (this.#exhaustedBuckets.get(`${hash}:${route.major}`) ?? 0);
    if (!route.global) return bucketReset - now;

    // Global rate limit: 50 requests in any one second
    this.#globalRequestTimestamps = this.#globalRequestTimestamps.filter(
      (timestamp) => now - timestamp < this.#globalWindow
    );
    const windowReset =
      this.#globalRequestTimestamps.length >= this.#globalLimit
        ? this.#globalRequestTimestamps[0] + this.#globalWindow
        : 0;

    return Math.max(bucketReset, windowReset, this.#globalReset) - now;
  };

  /**
   * Execute a single request and handle rate limit headers
   */
  #executeRequest = async (
    request: QueuedRequest,
    retryCount = 0
  ): Promise<Response> => {
    const headers: HeadersInit = {};

    // Anonymous endpoints (webhook/interaction tokens in the URL) must NOT
    // send an Authorization header — Discord rejects requests that present
    // both forms of auth. Otherwise we use the token captured for this
    // request at enqueue time (see queueRequest), which isolates per-request
    // (e.g. OAuth2 bearer) tokens from concurrent callers.
    if (!request.options?.anonymous) {
      headers.Authorization = request.token ?? this.getSession();
    }

    // Audit-log reason. URL-encode so non-ASCII characters survive the
    // single-line HTTP header field.
    if (request.options?.reason) {
      headers[`X-Audit-Log-Reason`] = encodeURIComponent(
        request.options.reason
      );
    }

    // FormData bodies (file uploads) must NOT have a manual Content-Type
    // header — fetch sets it to `multipart/form-data; boundary=...`
    // automatically. JSON bodies get application/json.
    if (request.body && !(request.body instanceof FormData)) {
      headers[`Content-Type`] = `application/json`;
    }

    const response = await fetch(request.resource.toString(), {
      method: request.method,
      body: request.body,
      headers
    });

    // Update rate limit tracking from headers
    this.#updateRateLimits(request.route, response);

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      if (retryCount >= this.maxRetries) {
        console.error(
          `Max retries (${this.maxRetries}) exceeded for ${redactToken(request.resource)}`
        );
        return response; // Return the 429 response instead of retrying forever
      }

      const retryAfter = parseFloat(response.headers.get(`Retry-After`) ?? `1`);
      const isGlobal = response.headers.get(`X-RateLimit-Global`) === `true`;
      const scope = response.headers.get(`X-RateLimit-Scope`);

      if (isGlobal || scope === `global`) {
        console.warn(`Hit global rate limit`);
        // Every other queue checks this before it sends. Interaction routes
        // do not, since Discord does not count them against the global limit.
        this.#globalReset = Date.now() + retryAfter * 1000;
      }

      // Wait before retrying. This holds up only this request's queue.
      await sleep(retryAfter * 1000);
      await this.#awaitTurn(request.route);

      // Retry with incremented counter
      return this.#executeRequest(request, retryCount + 1);
    }

    // Track invalid requests (401, 403, 429 excluding shared scope)
    if (
      [401, 403].includes(response.status) ||
      (response.status === 429 &&
        response.headers.get(`X-RateLimit-Scope`) !== `shared`)
    ) {
      this.#trackInvalidRequest();
    }

    return response;
  };

  /**
   * Update rate limit buckets from response headers.
   *
   * Discord names a bucket by its hash, which every route limited together
   * shares, but counts it per major parameter: one channel running out does
   * not hold up another. So the route maps to a hash, and the count is kept
   * under the hash and the major parameter together.
   */
  #updateRateLimits = (route: Route, response: Response): void => {
    const bucket = response.headers.get(`X-RateLimit-Bucket`);
    const remaining = response.headers.get(`X-RateLimit-Remaining`);
    const resetAfter = response.headers.get(`X-RateLimit-Reset-After`);
    if (!bucket) return;

    this.#bucketHashes.set(route.key, bucket);
    if (!remaining || !resetAfter) return;

    const key = `${bucket}:${route.major}`;
    if (parseInt(remaining, 10) === 0) {
      // Reset-After rather than Reset, so that a local clock that disagrees
      // with Discord's does not change how long we wait.
      this.#exhaustedBuckets.set(
        key,
        Date.now() + parseFloat(resetAfter) * 1000
      );
    } else {
      this.#exhaustedBuckets.delete(key);
    }
  };

  /**
   * Track invalid requests for Cloudflare ban prevention
   */
  #trackInvalidRequest = (): void => {
    const now = Date.now();

    // Reset counter if window has passed
    if (now - this.#invalidRequests.windowStart >= this.#invalidRequestWindow) {
      this.#resetInvalidRequestCounter();
    }

    this.#invalidRequests.count++;

    if (this.#invalidRequests.count >= this.#invalidRequestLimit) {
      console.error(
        `Approaching invalid request limit! Bot may be temporarily banned.`
      );
    }
  };

  /**
   * Check if we're temporarily banned
   */
  #isTemporarilyBanned = (): boolean => {
    const now = Date.now();
    if (now - this.#invalidRequests.windowStart < this.#invalidRequestWindow) {
      return this.#invalidRequests.count >= this.#invalidRequestLimit;
    }
    return false;
  };

  /**
   * Reset invalid request counter
   */
  #resetInvalidRequestCounter = (): void => {
    this.#invalidRequests = {
      count: 0,
      windowStart: Date.now()
    };
  };

  /**
   * Get current queue size: requests not yet sent, across every bucket
   * (useful for monitoring)
   */
  getQueueSize = (): number => {
    let size = 0;
    for (const queue of this.#queues.values()) size += queue.length;
    return size;
  };
}

export const discord: DiscordSession = new DiscordSession();
