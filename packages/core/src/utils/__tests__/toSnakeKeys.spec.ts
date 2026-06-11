import { describe, it, expect } from "vite-plus/test";
import { toSnakeKeys } from "../toSnakeKeys.js";

describe(`toSnakeKeys`, () => {
  it(`converts object camelCase keys to snake_case keys`, () => {
    const actual = toSnakeKeys({
      fooBar: [
        {
          BazQux: 1234
        }
      ],
      ignore_this: 5678
    });
    const expected = {
      foo_bar: [
        {
          baz_qux: 1234
        }
      ],
      ignore_this: 5678
    };
    expect(actual).toStrictEqual(expected);
  });
});
