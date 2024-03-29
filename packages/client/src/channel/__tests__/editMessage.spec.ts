import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  editMessage,
  editMessageProcedure,
  editMessageSafe,
  editMessageSchema
} from "../editMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`editMessage`, () => {
  mockRequest.patch(`/channels/:channel/messages/:message`, messageSchema);
  const config = mockSchema(editMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(editMessageSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(editMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(editMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
