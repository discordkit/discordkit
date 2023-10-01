import { z } from "zod";
import { generateMock } from "@anatine/zod-mock";
import { Snowflake } from "nodejs-snowflake";
import { snowflake } from "../snowflake.ts";

describe(`snowflake`, () => {
  const uid = new Snowflake({ custom_epoch: 1420070400000 });

  it(`correctly parses Discord Snowflake IDs`, () => {
    expect(snowflake.safeParse(uid.getUniqueID().toString()).success).toBe(
      true
    );
    expect(snowflake.safeParse(null).success).toBe(false);
    expect(() => snowflake.parse(undefined)).toThrow();
  });

  it(`integrates with zod-mock`, () => {
    const sampleSchema = z.object({
      userId: snowflake,
      invalid: z.any()
    });
    const actual = generateMock(sampleSchema, {
      backupMocks: {
        ZodAny: (ref) => {
          // @ts-expect-error
          if (ref === (snowflake as z.ZodEffects<z.ZodAny>)._def.schema) {
            return uid.getUniqueID().toString();
          }
        }
      }
    });

    expect(() => sampleSchema.parse(actual)).not.toThrow();
    expect(sampleSchema.parse(actual).invalid).toBeUndefined();
  });
});
