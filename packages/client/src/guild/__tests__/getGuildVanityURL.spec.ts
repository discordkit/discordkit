import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { partial } from "valibot";
import {
  getGuildVanityURLProcedure,
  getGuildVanityURLQuery,
  getGuildVanityURLSafe,
  getGuildVanityURLSchema
} from "../getGuildVanityURL.js";
import { inviteSchema } from "../../invite/types/Invite.js";

describe(`getGuildVanityURL`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/vanity-url`,
    getGuildVanityURLSchema,
    partial(inviteSchema)
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildVanityURLSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildVanityURLProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildVanityURLQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
