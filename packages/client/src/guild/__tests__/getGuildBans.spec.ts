import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { array, length, pipe } from "valibot";
import {
  getGuildBansProcedure,
  getGuildBansQuery,
  getGuildBansSafe,
  getGuildBansSchema
} from "../getGuildBans.js";
import { banSchema } from "../types/Ban.js";

describe(`getGuildBans`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/bans`,
    getGuildBansSchema,
    pipe(array(banSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildBansSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(getGuildBansProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildBansQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
