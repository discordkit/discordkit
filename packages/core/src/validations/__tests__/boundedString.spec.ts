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
});
