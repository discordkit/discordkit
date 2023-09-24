import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getGuildBanProcedure,
  getGuildBanQuery,
  getGuildBanSchema
} from "../getGuildBan";
import { banSchema } from "../types/Ban";

describe(`getGuildBan`, () => {
  const expected = mockRequest.get(`/guilds/:guild/bans/:user`, banSchema);
  const config = generateMock(getGuildBanSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildBanProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildBanQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
