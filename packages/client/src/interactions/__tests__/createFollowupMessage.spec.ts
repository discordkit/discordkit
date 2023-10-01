import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createFollowupMessage,
  createFollowupMessageProcedure,
  createFollowupMessageSafe,
  createFollowupMessageSchema
} from "../createFollowupMessage.ts";

describe(`createFollowupMessage`, () => {
  mockRequest.post(`/webhooks/:application/:token`);
  const config = generateMock(createFollowupMessageSchema);

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
