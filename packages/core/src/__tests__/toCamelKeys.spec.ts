import { toCamelKeys } from "../toCamelKeys.js";

describe(`toCamelKeys`, () => {
  it(`converts object snake_case keys to camelCase keys`, () => {
    const actual = toCamelKeys({
      foo_bar: [
        {
          baz_qux: 1234
        }
      ],
      ignoreThis: 5678
    });
    const expected = {
      fooBar: [
        {
          bazQux: 1234
        }
      ],
      ignoreThis: 5678
    };
    expect(actual).toStrictEqual(expected);
  });
});
