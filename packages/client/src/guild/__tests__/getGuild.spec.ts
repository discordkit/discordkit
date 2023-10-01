import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getGuildProcedure,
  getGuildQuery,
  getGuildSafe,
  getGuildSchema
} from "../getGuild.ts";
import { guildSchema } from "../types/Guild.ts";

describe(`getGuild`, () => {
  const expected = mockRequest.get(`/guilds/:id`, guildSchema);
  const config = generateMock(getGuildSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
