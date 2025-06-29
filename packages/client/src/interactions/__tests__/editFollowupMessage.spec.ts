import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  editFollowupMessage,
  editFollowupMessageProcedure,
  editFollowupMessageSafe,
  editFollowupMessageSchema
} from "../editFollowupMessage.js";
import { messageSchema } from "../../messages/types/Message.js";

describe(`editFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/webhooks/:application/:token/messages/:message`,
    editFollowupMessageSchema,
    messageSchema
  );

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
