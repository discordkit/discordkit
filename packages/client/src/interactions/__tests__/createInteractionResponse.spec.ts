import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  createInteractionResponse,
  createInteractionResponseProcedure,
  createInteractionResponseSafe,
  createInteractionResponseSchema
} from "../createInteractionResponse.ts";

describe(`createInteractionResponse`, () => {
  mockRequest.post(`/interactions/:interaction/:token/callback`);
  const config = generateMock(createInteractionResponseSchema);

  it(`can be used standalone`, async () => {
    await expect(createInteractionResponseSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createInteractionResponseProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createInteractionResponse);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
