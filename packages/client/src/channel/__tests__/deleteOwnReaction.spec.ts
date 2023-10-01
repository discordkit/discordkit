import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  deleteOwnReaction,
  deleteOwnReactionProcedure,
  deleteOwnReactionSafe,
  deleteOwnReactionSchema
} from "../deleteOwnReaction.ts";

describe(`deleteOwnReaction`, () => {
  mockRequest.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/@me`
  );
  const config = generateMock(deleteOwnReactionSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteOwnReactionSafe(config)).resolves.not.toThrow();
  });

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