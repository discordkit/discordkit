import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getGuildBanProcedure,
  getGuildBanQuery,
  getGuildBanSafe,
  getGuildBanSchema
} from "../getGuildBan.js";
import { banSchema } from "../types/Ban.js";

describe(`getGuildBan`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/bans/:user`,
    getGuildBanSchema,
    banSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildBanSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildBanProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildBanQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
