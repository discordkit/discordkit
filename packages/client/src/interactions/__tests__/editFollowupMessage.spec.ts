import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editFollowupMessage,
  editFollowupMessageProcedure,
  editFollowupMessageSafe,
  editFollowupMessageSchema
} from "../editFollowupMessage.ts";
import { messageSchema } from "../../channel/types/Message.ts";

describe(`editFollowupMessage`, () => {
  mockRequest.patch(
    `/webhooks/:application/:token/messages/:message`,
    messageSchema
  );
  const config = mockSchema(editFollowupMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(editFollowupMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editFollowupMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editFollowupMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
