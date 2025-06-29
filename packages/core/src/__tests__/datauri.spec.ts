import { safeParse, parse, object, any } from "valibot";
import { MockUtils } from "#mock-utils";
import { faker } from "@faker-js/faker";
import { datauri } from "../datauri.js";
import { discord } from "../DiscordSession.js";

const mockUtils = new MockUtils(discord, {
  customMocks: (schema): unknown => {
    if (MockUtils.titlesMatch(schema, datauri)) return faker.image.dataUri();
  }
});

describe.concurrent(`datauri`, { repeats: 5 }, () => {
  it(`correctly parses Data URIs`, () => {
    expect(safeParse(datauri, faker.image.dataUri()).success).toBe(true);
    expect(safeParse(datauri, null).success).toBe(false);
    expect(() => parse(datauri, undefined)).toThrow();
  });

  it(`integrates with valimock`, () => {
    const sampleSchema = object({
      image: datauri,
      invalid: any()
    });
    const actual = mockUtils.schema(sampleSchema);
    expect(() => parse(sampleSchema, actual)).not.toThrow();
    expect(parse(sampleSchema, actual).invalid).toBeUndefined();
  });
});
