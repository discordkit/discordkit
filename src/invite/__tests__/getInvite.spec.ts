import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runQuery,
  mockRequest
} from "../../../scripts/test-utils";
import {
  getInviteProcedure,
  getInviteQuery,
  getInviteSchema
} from "../getInvite";
import { inviteSchema } from "../types/Invite";

describe(`getInvite`, () => {
  mockRequest.get(`/invites/:code`, inviteSchema);
  const config = generateMock(getInviteSchema);

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
