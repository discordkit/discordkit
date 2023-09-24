import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createReaction,
  createReactionProcedure,
  createReactionSchema
} from "../createReaction";

describe(`createReaction`, () => {
  mockRequest.put(`/channels/:channel/messages/:message/reactions/:emoji/@me`);
  const config = generateMock(createReactionSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createReactionProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
