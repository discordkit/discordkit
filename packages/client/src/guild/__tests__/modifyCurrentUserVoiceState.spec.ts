import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateProcedure,
  modifyCurrentUserVoiceStateSafe,
  modifyCurrentUserVoiceStateSchema
} from "../modifyCurrentUserVoiceState.ts";

describe(`modifyCurrentUserVoiceState`, () => {
  mockRequest.patch(`/guilds/:guild/voice-states/@me`);
  const config = mockSchema(modifyCurrentUserVoiceStateSchema);

  it(`can be used standalone`, async () => {
    await expect(
      modifyCurrentUserVoiceStateSafe(config)
    ).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyCurrentUserVoiceStateProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyCurrentUserVoiceState);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
