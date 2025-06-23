import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createChannelInvite,
  createChannelInviteProcedure,
  createChannelInviteSafe,
  createChannelInviteSchema
} from "../createChannelInvite.js";
import { inviteSchema } from "../../invite/types/Invite.js";

describe(`createChannelInvite`, () => {
  const expected = mockRequest.post(`/channels/:channel/invites`, inviteSchema);
  const config = mockSchema(createChannelInviteSchema);

  it(`can be used standalone`, async () => {
    await expect(createChannelInviteSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createChannelInviteProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createChannelInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
