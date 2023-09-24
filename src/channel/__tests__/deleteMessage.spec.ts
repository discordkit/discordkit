import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteMessage,
  deleteMessageProcedure,
  deleteMessageSchema
} from "../deleteMessage";

describe(`deleteMessage`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message`);
  const config = generateMock(deleteMessageSchema);

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
