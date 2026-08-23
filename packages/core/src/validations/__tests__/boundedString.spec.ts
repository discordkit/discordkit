import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { boundedString } from "../boundedString.js";

describe(`boundedString`, () => {
  it(`correctly parses strings`, () => {
    expect(v.safeParse(boundedString(), `DiscordKit`).success).toBe(true);
    expect(v.safeParse(boundedString(10), `DiscordKit`).success).toBe(true);
    expect(v.safeParse(boundedString({ min: 5 }), `DiscordKit`).success).toBe(
      true
    );
    expect(v.safeParse(boundedString({ min: 11 }), `DiscordKit`).success).toBe(
      false
    );
    expect(v.safeParse(boundedString({ max: 10 }), `DiscordKit`).success).toBe(
      true
    );
    expect(v.safeParse(boundedString({ max: 5 }), `DiscordKit`).success).toBe(
      false
    );
  });

  it(`errors on invalid input`, () => {
    expect(() => v.parse(boundedString(), ``)).toThrow();
    expect(() => v.parse(boundedString({ max: 5 }), ``)).toThrow();
    expect(() => v.parse(boundedString(5), `DiscordKit`)).toThrow();
  });

  it(`reports the received length, not a constant`, () => {
    const msg = (schema: v.GenericSchema<string>, input: unknown): string =>
      v.safeParse(schema, input).issues![0].message;

    expect(msg(boundedString({ max: 2 }), `hello`)).toBe(
      `Expected a string with a length >= 1 && <= 2, received: 5`
    );
    // Default min is 1 in the schema; the message must not claim 0.
    expect(msg(boundedString(), ``)).toBe(
      `Expected a string with a length >= 1, received: 0`
    );
  });
});
