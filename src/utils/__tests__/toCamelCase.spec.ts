import { toCamelCase } from "../toCamelCase";

describe(`toCamelCase`, () => {
  it(`converts snake_case to camelCase`, () => {
    const actual = toCamelCase(`snake_case`);
    const expected = `snakeCase`;
    expect(actual).toStrictEqual(expected);
  });
});
