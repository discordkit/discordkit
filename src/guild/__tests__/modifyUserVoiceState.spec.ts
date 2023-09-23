import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyUserVoiceState,
  modifyUserVoiceStateSchema
} from "../modifyUserVoiceState";

describe(`modifyUserVoiceState`, () => {
  mockRequest.patch(`/guilds/:guild/voice-states/:user`);
  const config = generateMock(modifyUserVoiceStateSchema);

  it(`is tRPC compatible`, () => {
    expect(async () => client.modifyUserVoiceState(config)).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyUserVoiceState);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
