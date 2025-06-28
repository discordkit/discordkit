import { safeParse, parse, object, any, getTitle } from "valibot";
import { MockUtils } from "#mock-utils";
import { snowflake } from "../snowflake.js";
import { discord } from "../DiscordSession.js";

const mockUtils = new MockUtils(discord, {
  customMocks: (schema): unknown => {
    if (getTitle(schema) === getTitle(snowflake))
      return MockUtils.uid.getUniqueID().toString();
  }
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
