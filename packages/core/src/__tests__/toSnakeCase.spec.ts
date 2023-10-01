import { toSnakeCase } from "../toSnakeCase.ts";

describe(`toSnakeCase`, () => {
  it(`converts camelCase to snake_case`, () => {
    const actual = toSnakeCase(`camelCase`);
    const expected = `camel_case`;
    expect(actual).toStrictEqual(expected);
  });
});
