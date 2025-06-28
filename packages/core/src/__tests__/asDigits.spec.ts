import { digits, object, parse, pipe, getTitle } from "valibot";
import { MockUtils } from "#mock-utils";
import { asDigits } from "../asDigits.js";
import { bitfield } from "../bitfield.js";
import { discord } from "../DiscordSession.js";

const StringFlags = {
  PINNED: `2`,
  REQUIRE_TAG: `16`,
  HIDE_MEDIA_DOWNLOAD_OPTIONS: `32768`
};

const NumberFlags = {
  PINNED: 2,
  REQUIRE_TAG: 16,
  HIDE_MEDIA_DOWNLOAD_OPTIONS: 32768
};

const BigIntFlags = {
  PINNED: 2n,
  REQUIRE_TAG: 16n,
  HIDE_MEDIA_DOWNLOAD_OPTIONS: 32768n
};

export const stringFlag = bitfield(`stringFlag`, StringFlags);

export const mockUtils = new MockUtils(discord, {
  customMocks: (schema): unknown => {
    if (getTitle(schema) === getTitle(stringFlag)) {
      return MockUtils.flags(StringFlags);
    }
  }
});

describe(`asString`, () => {
  it(`coerces a bitfield to a string`, () => {
    expect(
      parse(
        pipe(asDigits(bitfield(`stringFlag`, StringFlags)), digits()),
        StringFlags.PINNED
      )
    ).toBeTypeOf(`string`);
    expect(
      parse(
        pipe(asDigits(bitfield(`numberFlag`, NumberFlags)), digits()),
        NumberFlags.REQUIRE_TAG
      )
    ).toBeTypeOf(`string`);
    expect(
      parse(
        pipe(asDigits(bitfield(`bigintFlags`, BigIntFlags)), digits()),
        BigIntFlags.HIDE_MEDIA_DOWNLOAD_OPTIONS
      )
    ).toBeTypeOf(`string`);
  });

  it(`integrates with valimock`, () => {
    const sampleSchema = object({
      flags: asDigits(stringFlag)
    });
    const actual = mockUtils.schema(sampleSchema);
    expect(() => parse(sampleSchema, actual)).not.toThrow();
    expect(parse(sampleSchema, actual).flags).toBeTypeOf(`string`);
  });
});
