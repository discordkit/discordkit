import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { banSchema } from "../types/Ban.js";
import {
  getGuildBansProcedure,
  getGuildBansQuery,
  getGuildBansSafe,
  getGuildBansSchema
} from "../getGuildBans.js";

describe(`getGuildBans`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/bans`,
    getGuildBansSchema,
    v.pipe(v.array(banSchema), v.length(1))
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
