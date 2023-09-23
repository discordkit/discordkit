import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { createReaction, createReactionSchema } from "../createReaction";

describe(`createReaction`, () => {
  mockRequest.put(`/channels/:channel/messages/:message/reactions/:emoji/@me`);
  const config = generateMock(createReactionSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.createReaction(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
