import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { boundedInteger } from "../boundedInteger.js";

describe(`boundedInteger`, () => {
  it(`correctly parses strings`, () => {
    expect(v.safeParse(boundedInteger(10), 10).success).toBe(true);
    expect(v.safeParse(boundedInteger({ min: 5 }), 7).success).toBe(true);
    expect(v.safeParse(boundedInteger({ min: 11 }), 10).success).toBe(false);
    expect(v.safeParse(boundedInteger({ max: 10 }), 7).success).toBe(true);
    expect(v.safeParse(boundedInteger({ max: 5 }), 10).success).toBe(false);
  });

  it(`errors on invalid input`, () => {
    expect(() => v.parse(boundedInteger(5), 10)).toThrow();
    expect(() => v.parse(boundedInteger(5), 1.5)).toThrow();
  });

  it(`describes the bounds it actually enforces`, () => {
    // The message is user-facing (it surfaces in Discord bot replies), so it
    // must state the real value received, not the length of its string form.
    const msg = (schema: v.GenericSchema<number>, input: unknown): string =>
      v.safeParse(schema, input).issues![0].message;

    expect(msg(boundedInteger({ min: 1, max: 10 }), 99)).toBe(
      `Expected an integer with a value >= 1 && <= 10, received: 99`
    );
    // `max: 0` is a real bound, so it must appear in the message. A truthiness
    // check would silently drop it and misdescribe the schema.
    expect(msg(boundedInteger({ min: -5, max: 0 }), 3)).toBe(
      `Expected an integer with a value >= -5 && <= 0, received: 3`
    );
    expect(msg(boundedInteger({ min: 5 }), 3)).toBe(
      `Expected an integer with a value >= 5, received: 3`
    );
    expect(msg(boundedInteger(5), 10)).toBe(
      `Expected an integer with a value of 5, received: 10`
    );
  });
});
