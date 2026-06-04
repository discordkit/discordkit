import { addParams } from "../addParams.js";

describe(`addParams`, () => {
  it(`emits scalars once and arrays as repeated keys`, () => {
    const actual = addParams(new URL(`https://example.com`), {
      foo: `bar`,
      baz: [`qux`, `foo`],
      snakeCase: 123,
      removed: null
    });
    // Arrays follow Discord's "repeated query key" convention
    // (https://discord.com/developers/docs/reference#array-query-strings).
    const expected = new URL(
      `https://example.com?foo=bar&baz=qux&baz=foo&snake_case=123`
    );
    expect(actual).toStrictEqual(expected);
  });
});
