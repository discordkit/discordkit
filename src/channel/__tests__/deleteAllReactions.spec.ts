import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteAllReactions,
  deleteAllReactionsProcedure,
  deleteAllReactionsSchema
} from "../deleteAllReactions";

describe(`deleteAllReactions`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message/reactions`);
  const config = generateMock(deleteAllReactionsSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteAllReactionsProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteAllReactions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
