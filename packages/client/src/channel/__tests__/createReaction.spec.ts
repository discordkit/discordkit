import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  createReaction,
  createReactionProcedure,
  createReactionSafe,
  createReactionSchema
} from "../createReaction.js";

describe(`createReaction`, () => {
  mockRequest.put(`/channels/:channel/messages/:message/reactions/:emoji/@me`);
  const config = mockSchema(createReactionSchema);

  it(`can be used standalone`, async () => {
    await expect(createReactionSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createReactionProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createReaction);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
