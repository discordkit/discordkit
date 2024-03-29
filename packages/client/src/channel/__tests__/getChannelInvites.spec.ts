import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
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
    inviteMetadataSchema.array()
  );
  const config = mockSchema(getChannelInvitesSchema);

  it(`can be used standalone`, async () => {
    await expect(getChannelInvitesSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getChannelInvitesProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getChannelInvitesQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
