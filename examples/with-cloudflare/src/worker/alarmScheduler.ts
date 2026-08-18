import type { Scheduler } from "@discordkit/gateway";

/**
 * A {@link Scheduler} backed by Durable Object alarms.
 *
 * **Why this exists.** A DO's JavaScript timers die with its isolate. If the
 * object is evicted mid-session, a `setTimeout`-driven heartbeat simply stops:
 * Discord sees no heartbeat, closes the socket, and the session is gone with no
 * error anywhere. An alarm is durable state — it survives eviction and wakes the
 * object back up, which is why the reference implementation
 * (`dcartertwo/discord-gateway-cloudflare-do`) drives its heartbeat this way.
 *
 * **Why it lives in the example rather than the package.** Alarms are a
 * Cloudflare primitive, not a platform pattern — no other runtime surveyed
 * (Node, Deno, Bun, Vercel, Netlify, Fastly) has an equivalent, and celld only
 * has one because it clones the DO model. `@discordkit/gateway` deliberately
 * keeps vendor APIs off its hot path, which `vp run check:bundle` enforces.
 *
 * **The multiplexing.** A DO has exactly ONE alarm slot, and alarms do not
 * repeat — each fire must re-arm the next. The connection meanwhile keeps
 * several timers pending at once (heartbeat, ACK timeout, reconnect backoff), so
 * this tracks them itself and keeps the alarm armed for whichever is due first.
 * `alarm()` then runs everything that has come due.
 *
 * @example
 * ```ts
 * const scheduler = alarmScheduler(this.ctx);
 * new GatewayConnection({ token, intents, scheduler });
 *
 * // and on the Durable Object:
 * override async alarm(): Promise<void> {
 *   await this.scheduler.onAlarm();
 * }
 * ```
 */
export interface AlarmScheduler extends Scheduler {
  /** Call from the Durable Object's `alarm()` handler. */
  onAlarm: () => Promise<void>;
}

interface PendingTimer {
  id: number;
  runAt: number;
  callback: () => void;
}

export const alarmScheduler = (ctx: DurableObjectState): AlarmScheduler => {
  const timers = new Map<number, PendingTimer>();
  let nextId = 1;

  /**
   * Keep the single alarm slot pointed at the earliest pending deadline.
   * Cloudflare warns against alarms on sub-second intervals for cost; Discord's
   * ~41s heartbeat is comfortably above that.
   */
  const arm = (): void => {
    const earliest = [...timers.values()].reduce<number | null>(
      (soonest, timer) =>
        soonest === null || timer.runAt < soonest ? timer.runAt : soonest,
      null
    );
    // `setAlarm` overwrites, so this both schedules and reschedules.
    if (earliest !== null) void ctx.storage.setAlarm(earliest);
    else void ctx.storage.deleteAlarm();
  };

  return {
    setTimeout: (callback, ms) => {
      const id = nextId++;
      timers.set(id, { id, runAt: Date.now() + ms, callback });
      arm();
      return id;
    },

    clearTimeout: (handle) => {
      if (timers.delete(handle as number)) arm();
    },

    onAlarm: async (): Promise<void> => {
      const now = Date.now();
      const due = [...timers.values()].filter((timer) => timer.runAt <= now);

      // Deleting first is defensive rather than load-bearing: `due` is captured
      // up front and deletion is by id, so a callback re-arming itself gets a
      // fresh entry either way. It keeps the map consistent if a callback
      // throws, and makes the re-arm below obviously correct.
      for (const timer of due) timers.delete(timer.id);
      for (const timer of due) timer.callback();

      // Alarms don't repeat, so the next deadline — including any a callback
      // just scheduled — must be armed here or it is silently lost.
      arm();
      // Idempotent by construction: Cloudflare notes alarms may fire more than
      // once in rare cases, and a second pass finds nothing with `runAt <= now`.
      await Promise.resolve();
    }
  };
};
