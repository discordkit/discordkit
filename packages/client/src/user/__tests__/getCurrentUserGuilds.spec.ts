import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getCurrentUserGuildsProcedure,
  getCurrentUserGuildsQuery,
  getCurrentUserGuildsSafe,
  getCurrentUserGuildsSchema
} from "../getCurrentUserGuilds.ts";
import { guildSchema } from "../../guild/types/Guild.ts";

describe(`getCurrentUserGuilds`, () => {
  const expected = mockRequest.get(
    `/users/@me/guilds`,
    guildSchema.partial().array().max(200).length(1)
  );
  const config = mockSchema(getCurrentUserGuildsSchema);

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserGuildsSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserGuildsProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserGuildsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
