import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteAllReactions,
  deleteAllReactionsProcedure,
  deleteAllReactionsSafe,
  deleteAllReactionsSchema
} from "../deleteAllReactions.js";

describe(`deleteAllReactions`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions`,
    deleteAllReactionsSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteAllReactionsSafe(config)).resolves.not.toThrow();
  });

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
