import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runQuery } from "#test-utils";
import {
  getCurrentUserVoiceStateProcedure,
  getCurrentUserVoiceStateQuery,
  getCurrentUserVoiceStateSafe,
  getCurrentUserVoiceStateSchema
} from "../getCurrentUserVoiceState.js";
import { voiceStateSchema } from "../types/VoiceState.js";

describe(`getCurrentUserVoiceState`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/guilds/:guild/voice-states/:user`,
    getCurrentUserVoiceStateSchema,
    voiceStateSchema
  );

  it(`can be used standalone`, async () => {
    await expect(getCurrentUserVoiceStateSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(getCurrentUserVoiceStateProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runQuery(getCurrentUserVoiceStateQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
