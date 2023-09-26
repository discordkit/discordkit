import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  createGuildChannel,
  createGuildChannelProcedure,
  createGuildChannelSchema
} from "../createGuildChannel";
import { channelSchema } from "../../channel/types/Channel";

describe(`createGuildChannel`, () => {
  const expected = mockRequest.post(`/guilds/:guild/channels`, channelSchema);
  const config = generateMock(createGuildChannelSchema);

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(createGuildChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(createGuildChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});