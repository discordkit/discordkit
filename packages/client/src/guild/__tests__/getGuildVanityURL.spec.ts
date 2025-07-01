import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { inviteSchema } from "../../invite/types/Invite.js";
import {
  getGuildVanityURLProcedure,
  getGuildVanityURLQuery,
  getGuildVanityURLSafe,
  getGuildVanityURLSchema
} from "../getGuildVanityURL.js";

describe(`getGuildVanityURL`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/vanity-url`,
    getGuildVanityURLSchema,
    v.partial(inviteSchema)
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
