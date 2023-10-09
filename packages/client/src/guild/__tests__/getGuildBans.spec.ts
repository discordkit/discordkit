import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import { array, length } from "valibot";
import {
  getGuildBansProcedure,
  getGuildBansQuery,
  getGuildBansSafe,
  getGuildBansSchema
} from "../getGuildBans.js";
import { banSchema } from "../types/Ban.js";

describe(`getGuildBans`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/bans`,
    array(banSchema, [length(1)])
  );
  const config = mockSchema(getGuildBansSchema);

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
