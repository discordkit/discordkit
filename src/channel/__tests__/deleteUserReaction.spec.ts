import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  deleteUserReaction,
  deleteUserReactionSchema
} from "../deleteUserReaction";

describe(`deleteUserReaction`, () => {
  mockRequest.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/:user`
  );
  const config = generateMock(deleteUserReactionSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.deleteUserReaction(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(deleteUserReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
