import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  crosspostMessage,
  crosspostMessageProcedure,
  crosspostMessageSafe,
  crosspostMessageSchema
} from "../crosspostMessage.js";
import { messageSchema } from "../types/Message.js";

describe(`crosspostMessage`, () => {
  mockRequest.post(
    `/channels/:channel/messages/:message/crosspost`,
    messageSchema
  );
  const config = mockSchema(crosspostMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(crosspostMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(crosspostMessageProcedure)(config)
    ).resolves.toBeDefined();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(crosspostMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
