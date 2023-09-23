import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteAllReactionsForEmoji,
  deleteAllReactionsForEmojiSchema
} from "../deleteAllReactionsForEmoji";

describe(`deleteAllReactionsForEmoji`, () => {
  mockRequest.delete(`/channels/:channel/messages/:message/reactions/:emoji`);
  const config = generateMock(deleteAllReactionsForEmojiSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteAllReactionsForEmoji(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteAllReactionsForEmoji);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
