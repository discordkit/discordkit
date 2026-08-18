import { env } from "cloudflare:workers";
import { runInDurableObject } from "cloudflare:test";
import { describe, it, expect, vi } from "vitest";
import { alarmScheduler } from "../worker/alarmScheduler.js";
import type { GatewayInspector } from "../worker/inspector.js";

/**
 * The alarm-backed scheduler has to multiplex several pending connection timers
 * (heartbeat, ACK timeout, reconnect backoff) onto a Durable Object's SINGLE
 * alarm slot, re-arming on each fire since alarms don't repeat. These specs pin
 * that multiplexing — getting it wrong means a timer that never fires, which
 * for the heartbeat is a silently dead Gateway session.
 */

const inspectorEnv = env as unknown as {
  INSPECTOR: DurableObjectNamespace<GatewayInspector>;
};

const withState = async (
  name: string,
  run: (ctx: DurableObjectState) => Promise<void> | void
): Promise<void> => {
  const stub = inspectorEnv.INSPECTOR.get(
    inspectorEnv.INSPECTOR.idFromName(name)
  );
  await runInDurableObject(stub, async (_instance, ctx) => {
    await run(ctx);
  });
};

describe(`alarmScheduler`, () => {
  it(`arms the alarm for the earliest pending timer`, async () => {
    await withState(`arm-earliest`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      scheduler.setTimeout(() => {}, 60_000);
      scheduler.setTimeout(() => {}, 1_000);

      // A single slot means the alarm must track the SOONEST deadline; arming
      // for the later one would delay the heartbeat past Discord's tolerance.
      const alarm = await ctx.storage.getAlarm();
      expect(alarm).not.toBeNull();
      expect(alarm! - Date.now()).toBeLessThan(30_000);
    });
  });

  it(`runs only the timers that are due`, async () => {
    await withState(`run-due`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      const due = vi.fn<() => void>();
      const notDue = vi.fn<() => void>();

      scheduler.setTimeout(due, 0);
      scheduler.setTimeout(notDue, 60_000);
      await scheduler.onAlarm();

      expect(due).toHaveBeenCalledOnce();
      expect(notDue).not.toHaveBeenCalled();
    });
  });

  it(`moves the alarm forward to the next timer after firing`, async () => {
    await withState(`re-arm`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      scheduler.setTimeout(() => {}, 0);
      scheduler.setTimeout(() => {}, 60_000);

      await scheduler.onAlarm();

      // Assert the alarm MOVED, not merely that one exists: the initial
      // `setTimeout` already armed it at the 0ms deadline, so a scheduler that
      // never re-armed would still leave a non-null (but stale, already-past)
      // alarm behind. Alarms don't repeat, so failing to move it forward means
      // every timer after the first is silently lost.
      const alarm = await ctx.storage.getAlarm();
      expect(alarm).not.toBeNull();
      expect(alarm! - Date.now()).toBeGreaterThan(1_000);
    });
  });

  it(`supports a callback scheduling its own next run`, async () => {
    await withState(`self-reschedule`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      const beat = vi.fn<() => void>(() => {
        scheduler.setTimeout(beat, 45_000);
      });

      scheduler.setTimeout(beat, 0);
      await scheduler.onAlarm();

      // This is exactly how the heartbeat works: the fired entry must be
      // removed BEFORE its callback runs, or the re-armed alarm would target a
      // deadline already in the past and spin.
      expect(beat).toHaveBeenCalledOnce();
      const alarm = await ctx.storage.getAlarm();
      expect(alarm).not.toBeNull();
      expect(alarm! - Date.now()).toBeGreaterThan(1_000);
    });
  });

  it(`clears the alarm when the last timer is cancelled`, async () => {
    await withState(`clear-last`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      const handle = scheduler.setTimeout(() => {}, 60_000);
      await expect(ctx.storage.getAlarm()).resolves.not.toBeNull();

      scheduler.clearTimeout(handle);

      // A leftover alarm would wake the Durable Object forever to service a
      // connection nobody has — billed duration for nothing.
      await expect(ctx.storage.getAlarm()).resolves.toBeNull();
    });
  });

  it(`is idempotent when an alarm fires twice`, async () => {
    await withState(`idempotent`, async (ctx) => {
      const scheduler = alarmScheduler(ctx);
      const ran = vi.fn<() => void>();
      scheduler.setTimeout(ran, 0);

      await scheduler.onAlarm();
      await scheduler.onAlarm();

      // Cloudflare notes alarms may fire more than once in rare cases, so
      // handlers must tolerate it.
      expect(ran).toHaveBeenCalledOnce();
    });
  });
});
