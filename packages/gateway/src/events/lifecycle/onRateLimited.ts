import { dispatchEvent } from "../dispatch.js";
import type { RateLimited } from "./types/RateLimited.js";

/**
 * ### [Rate Limited](https://discord.com/developers/docs/events/gateway-events#rate-limited)
 *
 * Sent when the app hits a per-event gateway rate limit. `retryAfter` is in seconds.
 *
 * Never gated by an intent.
 */
export const onRateLimited = dispatchEvent<RateLimited, `RATE_LIMITED`>(
  `RATE_LIMITED`
);
