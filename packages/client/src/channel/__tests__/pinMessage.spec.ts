import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  pinMessage,
  pinMessageProcedure,
  pinMessageSafe,
  pinMessageSchema
} from "../pinMessage.js";

describe(`pinMessage`, () => {
  mockRequest.put(`/channels/:channel/pins/:message`);
  const config = mockSchema(pinMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(pinMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(pinMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(pinMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
