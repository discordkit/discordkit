import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createChannelInvite,
  createChannelInviteProcedure,
  createChannelInviteSafe,
  createChannelInviteSchema
} from "../createChannelInvite";
import { inviteSchema } from "../../invite/types/Invite";

describe(`createChannelInvite`, () => {
  const expected = mockRequest.post(`/channels/:channel/invites`, inviteSchema);
  const config = generateMock(createChannelInviteSchema);

  it(`can be used standalone`, async () => {
    await expect(createChannelInviteSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createChannelInviteProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createChannelInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
