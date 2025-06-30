import { addParams } from "../addParams.js";

describe(`addParams`, () => {
  it(`behaves as expected`, () => {
    const actual = addParams(new URL(`https://example.com`), {
      foo: `bar`,
      baz: [`qux`, `foo`],
      snakeCase: 123,
      removed: null
    });
    const expected = new URL(
      `https://example.com?foo=bar&baz=qux%2Cfoo&snake_case=123`
    );
    expect(actual).toStrictEqual(expected);
  });
});
