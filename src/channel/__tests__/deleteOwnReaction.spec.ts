import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteOwnReaction,
  deleteOwnReactionProcedure,
  deleteOwnReactionSchema
} from "../deleteOwnReaction";

describe(`deleteOwnReaction`, () => {
  mockRequest.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/@me`
  );
  const config = generateMock(deleteOwnReactionSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteOwnReactionProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteOwnReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
