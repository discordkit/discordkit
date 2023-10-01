import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest } from "test-utils";
import {
  triggerTypingIndicator,
  triggerTypingIndicatorProcedure,
  triggerTypingIndicatorSafe,
  triggerTypingIndicatorSchema
} from "../triggerTypingIndicator.ts";

describe(`triggerTypingIndicator`, () => {
  mockRequest.post(`/channels/:channel/typing`);
  const config = generateMock(triggerTypingIndicatorSchema);

  it(`can be used standalone`, async () => {
    await expect(triggerTypingIndicatorSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(triggerTypingIndicatorProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(triggerTypingIndicator);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
