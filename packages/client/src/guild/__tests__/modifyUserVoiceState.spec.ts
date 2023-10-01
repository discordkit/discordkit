import { waitFor } from "@testing-library/react";
import { runProcedure, runMutation, mockRequest, mockSchema } from "test-utils";
import {
  modifyUserVoiceState,
  modifyUserVoiceStateProcedure,
  modifyUserVoiceStateSafe,
  modifyUserVoiceStateSchema
} from "../modifyUserVoiceState.ts";

describe(`modifyUserVoiceState`, () => {
  mockRequest.patch(`/guilds/:guild/voice-states/:user`);
  const config = mockSchema(modifyUserVoiceStateSchema);

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
