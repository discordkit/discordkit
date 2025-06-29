import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  triggerTypingIndicator,
  triggerTypingIndicatorProcedure,
  triggerTypingIndicatorSafe,
  triggerTypingIndicatorSchema
} from "../triggerTypingIndicator.js";

describe(`triggerTypingIndicator`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/typing`,
    triggerTypingIndicatorSchema
  );

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
