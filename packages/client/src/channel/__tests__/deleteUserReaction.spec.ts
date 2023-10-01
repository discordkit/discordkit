import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  deleteUserReaction,
  deleteUserReactionProcedure,
  deleteUserReactionSafe,
  deleteUserReactionSchema
} from "../deleteUserReaction.ts";

describe(`deleteUserReaction`, () => {
  mockRequest.delete(
    `/channels/:channel/messages/:message/reactions/:emoji/:user`
  );
  const config = mockSchema(deleteUserReactionSchema);

  it(`can be used standalone`, async () => {
    await expect(deleteUserReactionSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(deleteUserReactionProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(deleteUserReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
