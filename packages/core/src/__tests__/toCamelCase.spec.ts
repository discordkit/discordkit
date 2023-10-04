import { toCamelCase } from "../toCamelCase.js";

describe(`toCamelCase`, () => {
  it(`converts snake_case to camelCase`, () => {
    const actual = toCamelCase(`snake_case`);
    const expected = `snakeCase`;
    expect(actual).toStrictEqual(expected);
  });
});
