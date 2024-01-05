import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  deleteMessage,
  deleteMessageProcedure,
  deleteMessageSafe,
  deleteMessageSchema
} from "../deleteMessage.js";

describe(`deleteMessage`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message`);
  const config = mockSchema(deleteMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
