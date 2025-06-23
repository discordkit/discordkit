import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  unpinMessage,
  unpinMessageProcedure,
  unpinMessageSafe,
  unpinMessageSchema
} from "../unpinMessage.js";

describe(`unpinMessage`, () => {
  mockRequest.delete(`/channels/:channel/pins/:message`);
  const config = mockSchema(unpinMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(unpinMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(unpinMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(unpinMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
