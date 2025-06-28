import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiProcedure,
  deleteAllReactionsForEmojiSafe,
  deleteAllReactionsForEmojiSchema
} from "../deleteAllReactionsForEmoji.js";

describe(`deleteAllReactionsForEmoji`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.delete(
    `/channels/:channel/messages/:message/reactions/:emoji`,
    deleteAllReactionsForEmojiSchema
  );

  it(`can be used standalone`, async () => {
    await expect(deleteAllReactionsForEmojiSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteAllReactionsForEmojiProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteAllReactionsForEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
