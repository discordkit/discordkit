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
});
