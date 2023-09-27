import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createMessage,
  createMessageProcedure,
  createMessageSchema
} from "../createMessage";
import { messageSchema } from "../types/Message";

describe(`createMessage`, () => {
  mockRequest.post(`/channels/:channel/messages`, messageSchema);
  const config = generateMock(createMessageSchema);

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
