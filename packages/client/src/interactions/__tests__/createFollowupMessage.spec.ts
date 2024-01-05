import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest,
  mockSchema
} from "#test-utils";
import {
  createFollowupMessage,
  createFollowupMessageProcedure,
  createFollowupMessageSafe,
  createFollowupMessageSchema
} from "../createFollowupMessage.js";

describe(`createFollowupMessage`, () => {
  mockRequest.post(`/webhooks/:application/:token`);
  const config = mockSchema(createFollowupMessageSchema);

  it(`can be used standalone`, async () => {
    await expect(createFollowupMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createFollowupMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createFollowupMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
