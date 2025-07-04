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
});
