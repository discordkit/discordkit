import * as v from "valibot";
import { snowflake } from "@discordkit/core";
import { mockUtils } from "#mocks";
import { runMutation, runProcedure } from "#test-utils";
import { waitFor } from "@testing-library/dom";
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
    v.object({
      bannedUsers: v.array(snowflake),
      failedUsers: v.array(snowflake)
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
