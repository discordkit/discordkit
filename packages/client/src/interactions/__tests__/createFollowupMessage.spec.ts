import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  createFollowupMessage,
  createFollowupMessageProcedure,
  createFollowupMessageSafe,
  createFollowupMessageSchema
} from "../createFollowupMessage.js";

describe(`createFollowupMessage`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/webhooks/:application/:token`,
    createFollowupMessageSchema
  );

  it(`can be used standalone`, async () => {
    await expect(createFollowupMessageSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createFollowupMessageProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createFollowupMessage);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
