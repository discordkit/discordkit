import { sleep } from "../utils/sleep.js";

export const endpoint = `https://discord.com/api/v10/`;

interface QueuedRequest {
  resource: URL;
  method: string;
  body?: string | null;
  resolve: (value: Response) => void;
  reject: (error: Error) => void;
  retryCount?: number; // Optional retry tracking
}

interface RateLimitBucket {
  limit: number;
  remaining: number;
  reset: number; // Epoch timestamp in seconds
  resetAfter: number; // Seconds until reset
}

interface InvalidRequestTracker {
  count: number;
  windowStart: number; // Timestamp in ms
}

/** @internal */
export class DiscordSession {
  endpoint: string = endpoint;
  maxRetries: number = 5;
  #authToken: string | null = null;

  // Rate limit tracking
  #buckets = new Map<string, RateLimitBucket>();
  #globalReset: number = 0; // Epoch timestamp when global limit resets
  #requestQueue: QueuedRequest[] = [];
  #processingQueue = false;

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
    return Boolean(this.#authToken);
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
    this.#buckets.clear();
    this.#globalReset = 0;
    this.#requestQueue = [];
    this.#globalRequestTimestamps = [];
    this.#invalidRequests = {
      count: 0,
      windowStart: Date.now()
    };
    return this;
  };

  getSession = (): string => {
    const token = this.#authToken;

    if (!token) {
      throw new Error(`Auth Token must be set before requests can be made.`);
    }

    return token;
  };

  /**
   * Queue a request to be processed with rate limiting
   */
  queueRequest = async (
    resource: URL,
    method: string,
    body?: string | null
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      this.#requestQueue.push({
        resource,
        method,
        body,
        resolve,
        reject
      });

      // Start processing if not already running
      void this.#processQueue(); // This will return early if already processing
    });
  };

  /**
   * Process the request queue with rate limiting
   */
  #processQueue = async (): Promise<void> => {
    if (this.#processingQueue) return;
    this.#processingQueue = true;

    while (this.#requestQueue.length > 0) {
      const now = Date.now();

      // Check if we're temporarily banned (invalid request limit)
      if (this.#isTemporarilyBanned()) {
        const waitTime =
          this.#invalidRequestWindow -
          (now - this.#invalidRequests.windowStart);
        console.warn(
          `Temporarily banned from Discord API. Waiting ${Math.ceil(waitTime / 1000)}s`
        );
        await sleep(waitTime);
        this.#resetInvalidRequestCounter();
      }

      // Check global rate limit (50 req/s)
      await this.#enforceGlobalRateLimit();

      // Check if we're under a global rate limit cooldown
      if (this.#globalReset > now / 1000) {
        const waitTime = (this.#globalReset - now / 1000) * 1000;
        await sleep(waitTime);
        continue;
      }

      const request = this.#requestQueue[0];
      if (typeof request === `undefined`) break;
      const bucket = this.#buckets.get(`${request.method}:${request.resource}`);

      if (bucket?.remaining === 0) {
        const resetTime = bucket.reset * 1000; // Convert to ms
        if (resetTime > now) {
          await sleep(resetTime - now);
        }
      }

      // Execute the request
      this.#requestQueue.shift();
      try {
        const response = await this.#executeRequest(request);
        request.resolve(response);
      } catch (error) {
        if (error instanceof Error) {
          request.reject(error);
        }
      }
    }

    this.#processingQueue = false;

    // Check if any requests were added while we were processing the last one
    if (this.#requestQueue.length > 0) {
      void this.#processQueue(); // Restart the processor
    }
  };

  /**
   * Execute a single request and handle rate limit headers
   */
  #executeRequest = async (
    request: QueuedRequest,
    retryCount = 0
  ): Promise<Response> => {
    const token = this.getSession();
    const now = Date.now();

    // Track this request for global rate limiting
    this.#globalRequestTimestamps.push(now);

    const headers: HeadersInit = {
      Authorization: token
    };

    if (request.body) {
      headers[`Content-Type`] = `application/json`;
    }

    const response = await fetch(request.resource.toString(), {
      method: request.method,
      body: request.body,
      headers
    });

    // Update rate limit tracking from headers
    this.#updateRateLimits(response);

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      if (retryCount >= this.maxRetries) {
        console.error(
          `Max retries (${this.maxRetries}) exceeded for ${request.resource}`
        );
        return response; // Return the 429 response instead of retrying forever
      }

      const retryAfter = response.headers.get(`Retry-After`) ?? `1`;
      const isGlobal = response.headers.get(`X-RateLimit-Global`) === `true`;
      const scope = response.headers.get(`X-RateLimit-Scope`);

      if (isGlobal || scope === `global`) {
        console.warn(`Hit global rate limit`);
        this.#globalReset = now / 1000 + parseFloat(retryAfter);
      }

      // Wait before retrying
      await sleep(parseFloat(retryAfter) * 1000);

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
   * Update rate limit buckets from response headers
   */
  #updateRateLimits = (response: Response): void => {
    const bucket = response.headers.get(`X-RateLimit-Bucket`);
    const limit = response.headers.get(`X-RateLimit-Limit`);
    const remaining = response.headers.get(`X-RateLimit-Remaining`);
    const reset = response.headers.get(`X-RateLimit-Reset`);
    const resetAfter = response.headers.get(`X-RateLimit-Reset-After`);

    if (bucket && limit && remaining && reset && resetAfter) {
      this.#buckets.set(bucket, {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseFloat(reset),
        resetAfter: parseFloat(resetAfter)
      });
    }
  };

  /**
   * Enforce global rate limit of 50 requests per second
   */
  #enforceGlobalRateLimit = async (): Promise<void> => {
    const now = Date.now();

    // Remove timestamps older than 1 second
    this.#globalRequestTimestamps = this.#globalRequestTimestamps.filter(
      (timestamp) => now - timestamp < this.#globalWindow
    );

    // If we're at the limit, wait
    if (this.#globalRequestTimestamps.length >= this.#globalLimit) {
      const oldestTimestamp = this.#globalRequestTimestamps[0];
      const waitTime = this.#globalWindow - (now - oldestTimestamp);
      if (waitTime > 0) {
        await sleep(waitTime);
      }
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
   * Get current queue size (useful for monitoring)
   */
  getQueueSize = (): number => this.#requestQueue.length;
}

export const discord = new DiscordSession();
