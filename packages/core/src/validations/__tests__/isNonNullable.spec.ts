import { isNonNullable } from "../../utils/isNonNullable.js";

describe(`isNonNullable`, () => {
  it.each([
    [null, false],
    [undefined, false],
    // void
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    [(() => {})(), false],
    // Truthy
    [`string`, true],
    [1, true],
    [true, true],
    // Falsy
    [``, true],
    [NaN, true],
    [0, true],
    [0, true],
    [false, true],
    // Type coercion
    [[], true],
    [{}, true]
  ])(`correctly matches against nullish values`, (val, expected) => {
    expect(isNonNullable(val)).toStrictEqual(expected);
  });
});
