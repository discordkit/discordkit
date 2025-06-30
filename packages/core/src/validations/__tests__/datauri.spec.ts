import { safeParse, parse, object, any, pipe } from "valibot";
import { MockUtils } from "#mock-utils";
import { faker } from "@faker-js/faker";
import { datauri } from "../datauri.js";
import { hasMimeType } from "../hasMimeType.js";
import { discord } from "../../requests/DiscordSession.js";

const mockUtils = new MockUtils(discord, {
  customMocks: [[datauri, () => faker.image.dataUri()]]
});

describe.concurrent(`datauri`, { repeats: 5 }, () => {
  it(`correctly parses Data URIs`, () => {
    expect(safeParse(datauri, faker.image.dataUri()).success).toBe(true);
    expect(safeParse(datauri, null).success).toBe(false);
    expect(() => parse(datauri, undefined)).toThrow();
  });

  it(`can be combined with additional validations`, () => {
    const sampleSchema = pipe(datauri, hasMimeType([`image/svg+xml`]));
    const actual = faker.image.dataUri();
    expect(safeParse(sampleSchema, actual).success).toBe(true);
    expect(safeParse(sampleSchema, null).success).toBe(false);
    expect(() => parse(sampleSchema, undefined)).toThrow();
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
