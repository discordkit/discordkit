import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createMessage,
  createMessageProcedure,
  createMessageSafe,
  createMessageSchema
} from "../createMessage.ts";
import { messageSchema } from "../types/Message.ts";

describe(`createMessage`, () => {
  mockRequest.post(`/channels/:channel/messages`, messageSchema);
  const config = generateMock(createMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(createMessageSafe(config)).resolves.toBeDefined();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});