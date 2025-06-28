import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createChannelInvite,
  createChannelInviteProcedure,
  createChannelInviteSafe,
  createChannelInviteSchema
} from "../createChannelInvite.js";
import { inviteSchema } from "../../invite/types/Invite.js";

describe(`createChannelInvite`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/invites`,
    createChannelInviteSchema,
    inviteSchema
  );

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
