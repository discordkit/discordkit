import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest, mockSchema } from "test-utils";
import {
  getInviteProcedure,
  getInviteQuery,
  getInviteSafe,
  getInviteSchema
} from "../getInvite.js";
import { inviteSchema } from "../types/Invite.js";

describe(`getInvite`, () => {
  mockRequest.get(`/invites/:code`, inviteSchema);
  const config = mockSchema(getInviteSchema);

  it(`can be used standalone`, async () => {
    await expect(getInviteSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getInviteProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getInviteQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
