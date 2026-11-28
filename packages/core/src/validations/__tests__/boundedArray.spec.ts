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

  it(`keeps the message of an issue inside an element`, () => {
    // A bounded array is often the outer layer of a deep tree, such as a message's components. When something deep inside is wrong, the error must name that problem; reporting the array's length message instead sends the caller looking at a length that is fine.
    const schema = boundedArray(
      v.object({
        name: v.string(`Expected the element's name to be a string`)
      }),
      { max: 5 }
    );
    const issues = v.safeParse(schema, [{ name: 1 }]).issues!;

    expect(issues[0].message).toBe(
      `Expected the element's name to be a string`
    );
  });

  it(`keeps valibot's own message for an element without a custom one`, () => {
    // A missing key carries no custom message; it must still get valibot's default, which names the key, not the array's length message.
    const issues = v.safeParse(boundedArray(v.object({ name: v.string() })), [
      {}
    ]).issues!;

    expect(issues[0].message).not.toMatch(/Expected an array with a length/);
    expect(issues[0].message).toMatch(/name/);
  });

  it(`still reports its own message when the input is not an array`, () => {
    expect(
      v.safeParse(boundedArray(v.string(), { max: 2 }), `DiscordKit`).issues![0]
        .message
    ).toMatch(/^Expected an array with a length >= 1 && <= 2/);
  });
});
