import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteInvite,
  deleteInviteProcedure,
  deleteInviteSafe,
  deleteInviteSchema
} from "../deleteInvite.js";
import { inviteSchema } from "../types/Invite.js";

describe(`deleteInvite`, () => {
  mockRequest.delete(`/invites/:code`, inviteSchema);
  const config = mockSchema(deleteInviteSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteInviteSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteInviteProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
