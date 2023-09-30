import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildBansProcedure,
  getGuildBansQuery,
  getGuildBansSafe,
  getGuildBansSchema
} from "../getGuildBans";
import { banSchema } from "../types/Ban";

describe(`getGuildBans`, () => {
  const expected = mockRequest.get(`/guilds/:guild/bans`, banSchema.array());
  const config = generateMock(getGuildBansSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildBansSafe(config)).resolves.toStrictEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildBansProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildBansQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
