import * as v from "valibot";
import { snowflake, toValidated } from "@discordkit/core";
import { mockUtils } from "#mocks";
import { bulkGuildBan, bulkGuildBanSchema } from "../bulkGuildBan.js";

describe(`bulkGuildBan`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/bulk-ban`,
    bulkGuildBanSchema,
    v.object({
      bannedUsers: v.array(snowflake),
      failedUsers: v.array(snowflake)
    })
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        bulkGuildBan,
        bulkGuildBanSchema,
        v.object({
          bannedUsers: v.array(snowflake),
          failedUsers: v.array(snowflake)
        })
      )(config)
    ).resolves.toEqual(expected);
  });
});
