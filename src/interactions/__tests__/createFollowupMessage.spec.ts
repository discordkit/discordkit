import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createFollowupMessage,
  createFollowupMessageProcedure,
  createFollowupMessageSchema
} from "../createFollowupMessage";

describe(`createFollowupMessage`, () => {
  mockRequest.post(`/webhooks/:application/:token`);
  const config = generateMock(createFollowupMessageSchema);

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
