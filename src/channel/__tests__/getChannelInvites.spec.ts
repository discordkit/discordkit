import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getChannelInvitesProcedure,
  getChannelInvitesQuery,
  getChannelInvitesSchema
} from "../getChannelInvites";
import { inviteSchema } from "../../invite/types/Invite";

describe(`getChannelInvites`, () => {
  const expected = mockRequest.get(
    `/channels/:channel/invites`,
    inviteSchema.array()
  );
  const config = generateMock(getChannelInvitesSchema);

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