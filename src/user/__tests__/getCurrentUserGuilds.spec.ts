import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getCurrentUserGuildsProcedure,
  getCurrentUserGuildsQuery,
  getCurrentUserGuildsSafe,
  getCurrentUserGuildsSchema
} from "../getCurrentUserGuilds";
import { guildSchema } from "../../guild/types/Guild";

describe(`getCurrentUserGuilds`, () => {
  const expected = mockRequest.get(
    `/users/@me/guilds`,
    guildSchema.partial().array().max(200)
  );
  const config = generateMock(getCurrentUserGuildsSchema);

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
