import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  modifyGuildChannelPositions,
  modifyGuildChannelPositionsSchema
} from "../modifyGuildChannelPositions";

describe(`modifyGuildChannelPositions`, () => {
  mockRequest.patch(`/guilds/:guild/channels`);
  const config = generateMock(modifyGuildChannelPositionsSchema);

  it(`is tRPC compatible`, () => {
    expect(async () =>
      client.modifyGuildChannelPositions(config)
    ).not.toThrow();
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyGuildChannelPositions);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
