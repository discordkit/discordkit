import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateProcedure,
  modifyCurrentUserVoiceStateSafe,
  modifyCurrentUserVoiceStateSchema
} from "../modifyCurrentUserVoiceState.js";

describe(`modifyCurrentUserVoiceState`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/guilds/:guild/voice-states/:user`,
    modifyCurrentUserVoiceStateSchema
  );

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
