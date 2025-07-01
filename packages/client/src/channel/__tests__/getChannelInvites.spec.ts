import * as v from "valibot";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import { waitFor } from "@testing-library/dom";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";
import {
  getChannelInvitesProcedure,
  getChannelInvitesQuery,
  getChannelInvitesSafe,
  getChannelInvitesSchema
} from "../getChannelInvites.js";

describe(`getChannelInvites`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/invites`,
    getChannelInvitesSchema,
    v.pipe(v.array(inviteMetadataSchema), v.length(1))
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
