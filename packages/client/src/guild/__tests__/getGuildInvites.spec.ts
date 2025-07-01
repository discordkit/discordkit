import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";
import {
  getGuildInvitesProcedure,
  getGuildInvitesQuery,
  getGuildInvitesSafe,
  getGuildInvitesSchema
} from "../getGuildInvites.js";

describe(`getGuildInvites`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/invites`,
    getGuildInvitesSchema,
    v.pipe(v.array(inviteMetadataSchema), v.length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getGuildInvitesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getGuildInvitesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getGuildInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
