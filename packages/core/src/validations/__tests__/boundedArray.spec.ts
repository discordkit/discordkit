import { describe, it, expect } from "vite-plus/test";
import * as v from "valibot";
import { boundedArray } from "../boundedArray.js";

describe(`boundedArray`, () => {
  it(`correctly parses strings`, () => {
    expect(v.safeParse(boundedArray(v.string()), [`DiscordKit`]).success).toBe(
      true
    );
    expect(
      v.safeParse(boundedArray(v.string(), 1), [`DiscordKit`]).success
    ).toBe(true);
    expect(
      v.safeParse(boundedArray(v.string(), { min: 2 }), [`Discord`, `Kit`])
        .success
    ).toBe(true);
    expect(
      v.safeParse(boundedArray(v.string(), { min: 11 }), [`DiscordKit`]).success
    ).toBe(false);
    expect(
      v.safeParse(boundedArray(v.string(), { max: 2 }), [`Discord`, `Kit`])
        .success
    ).toBe(true);
    expect(
      v.safeParse(boundedArray(v.string(), { max: 5 }), `DiscordKit`.split(``))
        .success
    ).toBe(false);
  });

  it(`errors on invalid input`, () => {
    expect(() => v.parse(boundedArray(v.string()), [])).toThrow();
    expect(() => v.parse(boundedArray(v.string(), { max: 5 }), [])).toThrow();
    expect(() =>
      v.parse(boundedArray(v.string(), 5), [`DiscordKit`])
    ).toThrow();
  });

  it(`reports the received length, not a constant`, () => {
    // valibot already sets `received` to the length for length-based actions,
    // so taking `.length` of it would report 1 for every possible input.
    const msg = (schema: v.GenericSchema<string[]>, input: unknown): string =>
      v.safeParse(schema, input).issues![0].message;

    expect(msg(boundedArray(v.string(), { max: 1 }), [`a`, `b`, `c`])).toBe(
      `Expected an array with a length >= 1 && <= 1, received: 3`
    );
    // Default min is 1 in the schema; the message must not claim 0.
    expect(msg(boundedArray(v.string()), [])).toBe(
      `Expected an array with a length >= 1, received: 0`
    );
  });
});
