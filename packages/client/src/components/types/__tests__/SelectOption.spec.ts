import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { selectOptionSchema } from "../SelectOption.js";

describe(`selectOptionSchema emoji`, () => {
  it(`accepts a Unicode emoji given only its name`, () => {
    // Discord's own string select example gives each option `"emoji": {"name": "🐜"}`. That payload is valid to send, so it must be valid here, without a `id: null` Discord never asked for.
    expect(
      v.safeParse(selectOptionSchema, {
        label: `Ant`,
        value: `ant`,
        emoji: { name: `🐜` }
      }).success
    ).toBe(true);
  });

  it(`still reads a Unicode emoji that Discord returns with a null id`, () => {
    expect(
      v.safeParse(selectOptionSchema, {
        label: `Ant`,
        value: `ant`,
        emoji: { id: null, name: `🐜` }
      }).success
    ).toBe(true);
  });
});
