import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  modifyUserVoiceState,
  modifyUserVoiceStateProcedure,
  modifyUserVoiceStateSafe,
  modifyUserVoiceStateSchema
} from "../modifyUserVoiceState.js";

describe(`modifyUserVoiceState`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.patch(
    `/guilds/:guild/voice-states/:user`,
    modifyUserVoiceStateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(modifyUserVoiceStateSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(modifyUserVoiceStateProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(modifyUserVoiceState);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
