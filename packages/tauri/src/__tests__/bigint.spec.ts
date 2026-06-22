import { describe, it, expect } from "vitest";
import { serialize, serializeArgs } from "../bigint.js";

/**
 * Snowflakes are branded `bigint` in `@discordkit/native`, but kkrpc's stdio
 * transport serializes with `JSON.stringify`, which THROWS on bigint. The bridge
 * therefore serializes bigints to strings (Discord's wire format) on every
 * outbound result/event. Without this, a friends-list call (every `Relationship`
 * carries a bigint `userId`) fails to serialize and the webview gets nothing —
 * the exact bug these tests guard against.
 */
describe(`bigint transport codec`, () => {
  it(`replaces bigints with decimal strings, deeply`, () => {
    const input = {
      userId: 962841907434700800n,
      nested: { id: 7n, name: `x` },
      list: [1n, 2n, { id: 3n }],
      keep: 42
    };
    expect(serialize(input)).toEqual({
      userId: `962841907434700800`,
      nested: { id: `7`, name: `x` },
      list: [`1`, `2`, { id: `3` }],
      keep: 42
    });
  });

  it(`produces JSON-serializable output (the real-transport guarantee)`, () => {
    // The raw bigint throws (this is the original failure); the serialized form
    // must round-trip cleanly through JSON, as the kkrpc transport requires.
    expect(() => JSON.stringify({ id: 1n })).toThrow();
    expect(() => JSON.stringify(serializeArgs([{ id: 1n }, 2n]))).not.toThrow();
  });

  it(`preserves 64-bit precision (the reason ids cross as strings)`, () => {
    const big = 9007199254740993n; // 2^53 + 1 — unrepresentable as a JS number
    expect(serialize(big)).toBe(`9007199254740993`);
  });

  it(`leaves non-bigint values untouched`, () => {
    expect(serialize({ a: 1, b: `s`, c: true, d: null })).toEqual({
      a: 1,
      b: `s`,
      c: true,
      d: null
    });
  });
});
