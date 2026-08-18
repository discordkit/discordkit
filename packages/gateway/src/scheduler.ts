/**
 * How the connection schedules its own timers.
 *
 * The default is the platform's global `setTimeout`/`clearTimeout`, which
 * WinterTC's Minimum Common API guarantees on every runtime that can host a
 * Gateway connection — Node 22+, Deno, Bun, Cloudflare Workers, Vercel,
 * Netlify, and Fastly. **Most consumers never touch this.**
 *
 * The seam exists for hosts that can schedule *more durably* than an in-memory
 * timer. The motivating case is a Cloudflare Durable Object: an evicted DO
 * loses its JS timers, so a `setTimeout`-driven heartbeat simply stops and the
 * session dies silently. A DO alarm survives eviction and re-arms the
 * connection on wake. `examples/with-cloudflare` implements exactly that in
 * ~40 lines; it deliberately lives there rather than here, because alarms are a
 * Cloudflare primitive and this package keeps vendor APIs off the hot path.
 *
 * It is also what makes timing testable: a fake scheduler lets a spec drive
 * heartbeat and backoff behavior without waiting in real time.
 *
 * ---
 *
 * **This is not a general scheduling abstraction, and shouldn't become one.**
 * It covers *connection-lifecycle* timing only — the heartbeat (~41s), its ACK
 * timeout, the identify jitter, and reconnect backoff. All of it is sub-minute
 * and cannot be driven externally: cron's floor is one minute, and every
 * durable-execution engine (Inngest, Trigger.dev, Temporal, Vercel Workflow)
 * orchestrates *steps* via replay rather than holding a live socket.
 *
 * Application scheduling on the minutes-to-months timescale — session cleanup,
 * leaderboards, scheduled posts — belongs on those platforms, not in here. See
 * the package README for that split.
 */
export interface Scheduler {
  /**
   * Run `callback` after `ms`. The returned handle is opaque: it is only ever
   * passed back to {@link Scheduler.clearTimeout}.
   */
  setTimeout: (callback: () => void, ms: number) => unknown;
  /**
   * Cancel a pending callback.
   *
   * Implementations MUST actually cancel. XState's custom-clock docs record the
   * failure mode: a `clearTimeout` that doesn't cancel produces race conditions
   * where a stale callback fires against fresh state — here that means a
   * heartbeat sent onto a replaced socket.
   */
  clearTimeout: (handle: unknown) => void;
}

/**
 * The platform's global timers — the default, and correct nearly everywhere.
 *
 * Only one-shot timeouts are used. Repeating work is expressed by scheduling
 * the next timeout from inside the callback, which is both what a single-slot
 * DO alarm can express and the more robust shape generally: `setInterval` will
 * happily queue overlapping runs if a tick outlasts its own interval.
 */
export const globalScheduler: Scheduler = {
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => {
    clearTimeout(handle as ReturnType<typeof setTimeout>);
  }
};
