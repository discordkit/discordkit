import { safeParse, parse, object, any } from "valibot";
import { Valimock } from "valimock";
import { Snowflake } from "nodejs-snowflake";
import { snowflake } from "../snowflake.js";

describe(`snowflake`, () => {
  const uid = new Snowflake({ custom_epoch: 1420070400000 });
  const mockSchema = new Valimock({
    customMocks: {
      custom: (ref) => {
        if (ref === snowflake) {
          return uid.getUniqueID().toString();
        }
      }
    }
  }).mock;

  it(`correctly parses Discord Snowflake IDs`, () => {
    expect(safeParse(snowflake, uid.getUniqueID().toString()).success).toBe(
      true
    );
    expect(safeParse(snowflake, null).success).toBe(false);
    expect(() => parse(snowflake, undefined)).toThrow();
  });

  it(`integrates with valimock`, () => {
    const sampleSchema = object({
      userId: snowflake,
      invalid: any()
    });
    const actual = mockSchema(sampleSchema);
    expect(() => parse(sampleSchema, actual)).not.toThrow();
    expect(parse(sampleSchema, actual).invalid).toBeUndefined();
  });
});
