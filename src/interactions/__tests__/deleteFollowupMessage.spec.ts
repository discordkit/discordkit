import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteFollowupMessage,
  deleteFollowupMessageProcedure,
  deleteFollowupMessageSchema
} from "../deleteFollowupMessage";

describe(`deleteFollowupMessage`, () => {
  mockRequest.delete(`/webhooks/:application/:token/messages/:message`);
  const config = generateMock(deleteFollowupMessageSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteFollowupMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteFollowupMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
