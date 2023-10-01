import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getGuildBanProcedure,
  getGuildBanQuery,
  getGuildBanSafe,
  getGuildBanSchema
} from "../getGuildBan.ts";
import { banSchema } from "../types/Ban.ts";

describe(`getGuildBan`, () => {
  const expected = mockRequest.get(`/guilds/:guild/bans/:user`, banSchema);
  const config = mockSchema(getGuildBanSchema);

  it(`can be used standalone`, async () => {
    await expect(getGuildBanSafe(config)).resolves.toStrictEqual(expected);
  });

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
