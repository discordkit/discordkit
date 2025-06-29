import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  sendSoundboardSound,
  sendSoundboardSoundProcedure,
  sendSoundboardSoundSafe,
  sendSoundboardSoundSchema
} from "../sendSoundboardSound.js";

describe(`sendSoundboardSound`, { repeats: 5 }, () => {
  const { config } = mockUtils.request.post(
    `/channels/:channel/send-soundboard-sound`,
    sendSoundboardSoundSchema
  );

  it(`can be used standalone`, async () => {
    await expect(sendSoundboardSoundSafe(config)).resolves.not.toThrow();
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(sendSoundboardSoundProcedure)(config)
    ).resolves.not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(sendSoundboardSound);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
