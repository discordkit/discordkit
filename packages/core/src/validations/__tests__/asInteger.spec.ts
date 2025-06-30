/* eslint-disable @typescript-eslint/prefer-literal-enum-member */
import type { InferOutput } from "valibot";
import { integer, parse, pipe, object, safeParse } from "valibot";
import { MockUtils } from "#mock-utils";
import { asInteger } from "../asInteger.js";
import { bitfield } from "../bitfield.js";
import { discord } from "../../requests/DiscordSession.js";

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

enum MessageFlag {
  CROSSPOSTED = 1 << 0,
  IS_CROSSPOST = 1 << 1,
  SUPPRESS_EMBEDS = 1 << 2,
  SOURCE_MESSAGE_DELETED = 1 << 3,
  URGENT = 1 << 4,
  HAS_THREAD = 1 << 5,
  EPHEMERAL = 1 << 6,
  LOADING = 1 << 7,
  FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
  SUPPRESS_NOTIFICATIONS = 1 << 12,
  IS_VOICE_MESSAGE = 1 << 13
}

const stringFlag = bitfield(`stringFlag`, StringFlags);
const numberFlag = bitfield(`numberFlag`, NumberFlags);
const bigintFlag = bitfield(`bigintFlag`, BigIntFlags);
const messageFlag = bitfield(
  `messageFlag`,
  MessageFlag,
  `Invalid Message Flag`
);

const mockUtils = new MockUtils(discord, {
  customMocks: [
    [stringFlag, MockUtils.flagMatcher(StringFlags)],
    [numberFlag, MockUtils.flagMatcher(NumberFlags)],
    [bigintFlag, MockUtils.flagMatcher(BigIntFlags)],
    [messageFlag, MockUtils.flagMatcher(MessageFlag)]
  ]
});

describe.concurrent(`asInteger`, () => {
  it(`coerces a bitfield to an integer`, () => {
    const actualStringFlag = parse(
      pipe(asInteger(bitfield(`stringFlag`, StringFlags)), integer()),
      StringFlags.PINNED
    );
    const actualNumberFlag = parse(
      pipe(asInteger(bitfield(`numberFlag`, NumberFlags)), integer()),
      NumberFlags.REQUIRE_TAG
    );
    const actualBigintFlag = parse(
      pipe(asInteger(bitfield(`bigintFlag`, BigIntFlags)), integer()),
      BigIntFlags.HIDE_MEDIA_DOWNLOAD_OPTIONS
    );

    expect(actualStringFlag).toBeTypeOf(`number`);
    expect(actualNumberFlag).toBeTypeOf(`number`);
    expect(actualBigintFlag).toBeTypeOf(`number`);
    expect(actualBigintFlag).not.toBeTypeOf(`bigint`);
  });

  it(`integrates with valimock`, { repeats: 5 }, () => {
    const sampleSchema = object({
      stringFlag: asInteger(stringFlag),
      numberFlag: asInteger(numberFlag),
      bigintFlag: asInteger(bigintFlag),
      messageFlag: asInteger(messageFlag)
    });

    const actual = safeParse(sampleSchema, mockUtils.schema(sampleSchema));
    expect(actual.issues).toBeUndefined();
    const result = actual.output as InferOutput<typeof sampleSchema>;
    expect(result.stringFlag).toBeTypeOf(`number`);
    expect(result.stringFlag).not.toBeTypeOf(`bigint`);
    expect(result.numberFlag).toBeTypeOf(`number`);
    expect(result.numberFlag).not.toBeTypeOf(`bigint`);
    expect(result.bigintFlag).toBeTypeOf(`number`);
    expect(result.bigintFlag).not.toBeTypeOf(`bigint`);
    expect(result.messageFlag).toBeTypeOf(`number`);
    expect(result.messageFlag).not.toBeTypeOf(`bigint`);
  });

  it(`serializes to JSON`, () => {
    const sampleSchema = object({
      stringFlag: asInteger(stringFlag),
      numberFlag: asInteger(numberFlag),
      bigintFlag: asInteger(bigintFlag),
      messageFlag: asInteger(messageFlag)
    });

    expect(() =>
      JSON.stringify(parse(sampleSchema, mockUtils.schema(sampleSchema)))
    ).not.toThrow();
  });
});
