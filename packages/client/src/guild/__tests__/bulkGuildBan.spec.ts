import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import { snowflake } from "@discordkit/core";
import { object, array } from "valibot";
import {
  bulkGuildBan,
  bulkGuildBanProcedure,
  bulkGuildBanSafe,
  bulkGuildBanSchema
} from "../bulkGuildBan.js";

describe(`bulkGuildBan`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/guilds/:guild/bulk-ban`,
    bulkGuildBanSchema,
    object({
      bannedUsers: array(snowflake),
      failedUsers: array(snowflake)
    })
  );

  it(`can be used standalone`, async () => {
    await expect(bulkGuildBanSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(bulkGuildBanProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(bulkGuildBan);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
