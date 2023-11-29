import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array, length, maxLength, partial } from "valibot";
import {
  getCurrentUserGuildsProcedure,
  getCurrentUserGuildsQuery,
  getCurrentUserGuildsSafe,
  getCurrentUserGuildsSchema
} from "../getCurrentUserGuilds.js";
import { guildSchema } from "../../guild/types/Guild.js";

describe(`getCurrentUserGuilds`, () => {
  const expected = mockRequest.get(
    `/users/@me/guilds`,
    array(partial(guildSchema), [maxLength(200), length(1)])
  );
  const config = mockSchema(getCurrentUserGuildsSchema);

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
