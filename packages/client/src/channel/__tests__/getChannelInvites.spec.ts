import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "#test-utils";
import { array } from "valibot";
import {
  getChannelInvitesProcedure,
  getChannelInvitesQuery,
  getChannelInvitesSafe,
  getChannelInvitesSchema
} from "../getChannelInvites.js";
import { inviteMetadataSchema } from "../../invite/types/InviteMetadata.js";

describe(`getChannelInvites`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/invites`,
    array(inviteMetadataSchema)
  );
  const config = mockSchema(getChannelInvitesSchema);

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
