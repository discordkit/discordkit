import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteFollowupMessage,
  deleteFollowupMessageProcedure,
  deleteFollowupMessageSafe,
  deleteFollowupMessageSchema
} from "../deleteFollowupMessage.ts";

describe(`deleteFollowupMessage`, () => {
  mockRequest.delete(`/webhooks/:application/:token/messages/:message`);
  const config = mockSchema(deleteFollowupMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteFollowupMessageSafe(config)).resolves.not.toThrow();
  });

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
