import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { reactionEmoji } from "../reactionEmoji.js";

describe(`reactionEmoji`, () => {
  it(`accepts every form the reaction endpoints take`, () => {
    // Reaction paths are not snowflake-only: typing them as `snowflake`
    // rejected the two most common forms at runtime, not just at build time.
    expect(v.safeParse(reactionEmoji, `❌`).success).toBe(true);
    expect(v.safeParse(reactionEmoji, `👍`).success).toBe(true);
    // custom emoji, as documented by the endpoint: `name:id`
    expect(
      v.safeParse(reactionEmoji, `catgirl:1234567890123456789`).success
    ).toBe(true);
    // a custom emoji's bare id
    expect(v.safeParse(reactionEmoji, `1234567890123456789`).success).toBe(
      true
    );
  });

  it(`still rejects input that cannot identify an emoji`, () => {
    expect(v.safeParse(reactionEmoji, ``).success).toBe(false);
    expect(v.safeParse(reactionEmoji, undefined).success).toBe(false);
    expect(v.safeParse(reactionEmoji, null).success).toBe(false);
    expect(v.safeParse(reactionEmoji, {}).success).toBe(false);
    // A numeric snowflake is accepted, matching `snowflake` itself, which
    // takes `number`/`bigint` at runtime. It stringifies into the path fine.
    expect(v.safeParse(reactionEmoji, 1234567890123456789n).success).toBe(true);
    // A `/` would split into a second path segment and hit a different
    // endpoint, so it can never be a valid reaction emoji.
    expect(v.safeParse(reactionEmoji, `a/b`).success).toBe(false);
    // Malformed `name:id`: the id must still be a valid snowflake.
    expect(v.safeParse(reactionEmoji, `catgirl:`).success).toBe(false);
    expect(v.safeParse(reactionEmoji, `catgirl:notanid`).success).toBe(false);
    expect(v.safeParse(reactionEmoji, `:1234567890123456789`).success).toBe(
      false
    );
  });
});
