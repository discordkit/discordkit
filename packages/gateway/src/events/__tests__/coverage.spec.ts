import { describe, it, expect } from "vite-plus/test";
import * as events from "../index.js";
import { EVENT_INTENTS } from "../../types/GatewayIntents.js";

/**
 * The coverage guard.
 *
 * Discord documents 84 receive events. This asserts the package ships a handler
 * for every one that can actually be dispatched, so a future doc refresh that
 * adds an event fails here rather than silently leaving a gap.
 */

interface Handler {
  event: string;
  intents: readonly string[];
}

/**
 * Every `onX` the package exports, by the wire name it subscribes to.
 *
 * The barrel also exports schemas and enums, so this filters structurally
 * rather than by name. Widening to `unknown` first is required: a type
 * predicate must be assignable to its parameter's type, and `Handler` isn't a
 * member of the union `Object.values` produces here.
 */
const handlers = (Object.values(events) as unknown[]).filter(
  (value): value is Handler =>
    typeof value === `function` && `event` in value && `intents` in value
);
const covered = new Set(handlers.map((h) => h.event));

/**
 * Documented under `## Receive Events` but NOT dispatchable, so no handler can
 * exist for them:
 *
 * - HELLO / RECONNECT / INVALID_SESSION are lifecycle **opcodes** (10, 7, 9).
 *   They arrive with no `t` field, so the dispatch fan-out — which routes on
 *   `t` — could never deliver them. `connection.ts` handles all three
 *   internally; `onStateChange` is how consumers observe the result.
 * - CLIENT_STATUS_OBJECT / ACTIVITY_OBJECT are structure definitions that share
 *   the docs' `####` heading level with real events. They're shapes used *by*
 *   PRESENCE_UPDATE, not events.
 */
const NOT_DISPATCHABLE = [
  `HELLO`,
  `RECONNECT`,
  `INVALID_SESSION`,
  `CLIENT_STATUS_OBJECT`,
  `ACTIVITY_OBJECT`
];

describe(`dispatch event coverage`, () => {
  it(`ships a handler for every dispatchable receive event`, () => {
    // Sourced from the cached docs via `vp run docs:gateway`: 84 receive
    // events, minus the five above that cannot be dispatched.
    const expected = 84 - NOT_DISPATCHABLE.length;
    expect(covered.size).toBe(expected);
  });

  it(`exports no handler for a non-dispatchable event`, () => {
    // A handler for HELLO would never fire — it has no `t` to route on — so
    // shipping one would be a promise the fan-out cannot keep.
    for (const name of NOT_DISPATCHABLE) {
      expect(covered.has(name)).toBe(false);
    }
  });

  it(`gives every handler a distinct wire name`, () => {
    // Two handlers on one wire name means one of them is a typo that will
    // never fire.
    expect(covered.size).toBe(handlers.length);
  });

  it(`agrees with the generated intent map for every gated event`, () => {
    // EVENT_INTENTS is generated from the docs' intent list. Any handler whose
    // event appears there must report exactly those intents — a mismatch means
    // a bot using `intentsFor` requests the wrong mask, which fails silently.
    const mismatched = handlers
      .filter((handler) => handler.event in EVENT_INTENTS)
      .filter((handler) => {
        const expected = (EVENT_INTENTS as Record<string, readonly string[]>)[
          handler.event
        ];
        return (
          handler.intents.length !== expected.length ||
          handler.intents.some((intent, i) => intent !== expected[i])
        );
      })
      .map((handler) => handler.event);

    expect(mismatched).toEqual([]);
  });

  it(`covers every event the docs' intent map gates`, () => {
    // The reverse direction: if the docs say an intent gates an event, we must
    // ship a handler for it. Catches an event added to the intent list that
    // nobody wired up.
    const ungated = Object.keys(EVENT_INTENTS).filter(
      (event) => !covered.has(event)
    );
    expect(ungated).toEqual([]);
  });
});
