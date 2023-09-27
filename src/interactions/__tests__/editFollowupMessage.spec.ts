import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  editFollowupMessage,
  editFollowupMessageProcedure,
  editFollowupMessageSchema
} from "../editFollowupMessage";
import { messageSchema } from "../../channel/types/Message";

describe(`editFollowupMessage`, () => {
  mockRequest.patch(
    `/webhooks/:application/:token/messages/:message`,
    messageSchema
  );
  const config = generateMock(editFollowupMessageSchema);

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
