import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runQuery, mockRequest } from "test-utils";
import {
  getInviteProcedure,
  getInviteQuery,
  getInviteSafe,
  getInviteSchema
} from "../getInvite.ts";
import { inviteSchema } from "../types/Invite.ts";

describe(`getInvite`, () => {
  mockRequest.get(`/invites/:code`, inviteSchema);
  const config = generateMock(getInviteSchema);

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
