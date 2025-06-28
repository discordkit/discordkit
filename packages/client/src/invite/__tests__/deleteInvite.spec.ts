import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteInvite,
  deleteInviteProcedure,
  deleteInviteSafe,
  deleteInviteSchema
} from "../deleteInvite.js";
import { inviteSchema } from "../types/Invite.js";

describe(`deleteInvite`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.delete(
    `/invites/:code`,
    deleteInviteSchema,
    inviteSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteInviteSafe(config)).resolves.toEqual(expected);
  });

  it(`is tRPC compatible`, async () => {
    await expect(runProcedure(deleteInviteProcedure)(config)).resolves.toEqual(
      expected
    );
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
