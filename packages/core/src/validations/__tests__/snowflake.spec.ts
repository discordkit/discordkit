import { safeParse, parse, object, any, is } from "valibot";
import { MockUtils } from "#mock-utils";
import { snowflake, snowflakeToDate, dateToSnowflake } from "../snowflake.js";
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
    const actual = MockUtils.uid.getUniqueID().toString();
    expect(() => snowflakeToDate(actual)).not.toThrow();
    expect(snowflakeToDate(actual)).toBeInstanceOf(Date);
  });
});

describe(`dateToSnowflake`, () => {
  it(`converts a Date to a valid snowflake`, () => {
    expect(() => dateToSnowflake(new Date(Date.now()))).not.toThrow();
    expect(dateToSnowflake(new Date(Date.now()))).toBeTypeOf(`string`);
    expect(is(snowflake, dateToSnowflake(new Date(Date.now())))).toBe(true);
  });
});
