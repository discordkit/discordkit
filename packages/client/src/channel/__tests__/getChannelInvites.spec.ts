import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { pipe, array, length } from "valibot";
import {
  getChannelInvitesProcedure,
  getChannelInvitesQuery,
  getChannelInvitesSafe,
  getChannelInvitesSchema
} from "../getChannelInvites.js";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";

describe(`getChannelInvites`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/invites`,
    getChannelInvitesSchema,
    pipe(array(inviteMetadataSchema), length(1))
  );

  it(`can be used standalone`, async () => {
    await expect(getChannelInvitesSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelInvitesProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
