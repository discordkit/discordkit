import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyCurrentUserVoiceState,
  modifyCurrentUserVoiceStateSchema
} from "../modifyCurrentUserVoiceState";

describe(`modifyCurrentUserVoiceState`, () => {
  mockRequest.patch(`/guilds/:guild/voice-states/@me`);
  const config = generateMock(modifyCurrentUserVoiceStateSchema);

  it(`is tRPC compatible`, () => {
    expect(async () =>
      client.modifyCurrentUserVoiceState(config)
    ).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyCurrentUserVoiceState);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
