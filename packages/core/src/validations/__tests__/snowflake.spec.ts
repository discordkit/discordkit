import { safeParse, parse, object, any } from "valibot";
import { MockUtils } from "#mock-utils";
import { snowflake, snowflakeToDate, DISCORD_EPOCH } from "../snowflake.js";
import { discord } from "../../requests/DiscordSession.js";

const mockUtils = new MockUtils(discord, {
  customMocks: [[snowflake, () => MockUtils.uid.getUniqueID().toString()]]
});

describe(`snowflake`, () => {
  it(`correctly parses Discord Snowflake IDs`, () => {
    expect(
      safeParse(snowflake, mockUtils.uid.getUniqueID().toString()).success
    ).toBe(true);
    expect(safeParse(snowflake, null).success).toBe(false);
    expect(safeParse(snowflake, ``).success).toBe(false);
    expect(safeParse(snowflake, `abc123`).success).toBe(false);
    expect(() => parse(snowflake, undefined)).toThrow();
  });

  it(`integrates with valimock`, () => {
    const sampleSchema = object({
      userId: snowflake,
      invalid: any()
    });
    const actual = mockUtils.schema(sampleSchema);
    expect(() => parse(sampleSchema, actual)).not.toThrow();
    expect(parse(sampleSchema, actual).invalid).toBeUndefined();
  });
});

describe(`snowflakeTodate`, () => {
  it(`converts a snowflake to a valid Date`, () => {
    const now = Date.now();
    const actual = MockUtils.uid.idFromTimestamp(now).toString();
    expect(() => snowflakeToDate(actual)).not.toThrow();
    const date = snowflakeToDate(actual);
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toStrictEqual(now);
    expect(date.getTime()).toBeGreaterThan(DISCORD_EPOCH);
  });
});
