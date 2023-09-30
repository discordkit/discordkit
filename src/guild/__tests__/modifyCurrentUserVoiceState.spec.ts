import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateProcedure,
  modifyCurrentUserVoiceStateSafe,
  modifyCurrentUserVoiceStateSchema
} from "../modifyCurrentUserVoiceState";

describe(`modifyCurrentUserVoiceState`, () => {
  mockRequest.patch(`/guilds/:guild/voice-states/@me`);
  const config = generateMock(modifyCurrentUserVoiceStateSchema);

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
