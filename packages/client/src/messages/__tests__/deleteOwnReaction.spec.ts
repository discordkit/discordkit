import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteOwnReaction,
  deleteOwnReactionProcedure,
  deleteOwnReactionSafe,
  deleteOwnReactionSchema
} from "../deleteOwnReaction.js";

describe(`deleteOwnReaction`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/@me`,
    deleteOwnReactionSchema
  );

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
