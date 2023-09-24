import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiProcedure,
  deleteAllReactionsForEmojiSchema
} from "../deleteAllReactionsForEmoji";

describe(`deleteAllReactionsForEmoji`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message/reactions/:emoji`);
  const config = generateMock(deleteAllReactionsForEmojiSchema);

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
