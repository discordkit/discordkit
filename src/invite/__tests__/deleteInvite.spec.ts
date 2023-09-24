import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteInvite,
  deleteInviteProcedure,
  deleteInviteSchema
} from "../deleteInvite";

describe(`deleteInvite`, () => {
  mockRequest.delete(`/invites/:code`);
  const config = generateMock(deleteInviteSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteInviteProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteInvite);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
