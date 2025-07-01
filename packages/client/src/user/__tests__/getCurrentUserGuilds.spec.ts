import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { guildSchema } from "../../guild/types/Guild.js";
import {
  getCurrentUserGuildsProcedure,
  getCurrentUserGuildsQuery,
  getCurrentUserGuildsSafe,
  getCurrentUserGuildsSchema
} from "../getCurrentUserGuilds.js";

describe(`getCurrentUserGuilds`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/users/@me/guilds`,
    getCurrentUserGuildsSchema,
    v.pipe(v.array(v.partial(guildSchema)), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserGuildsSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserGuildsProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserGuildsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
