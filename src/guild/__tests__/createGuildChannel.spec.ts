import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  createGuildChannel,
  createGuildChannelSchema
} from "../createGuildChannel";
import { channelSchema } from "../../channel/types/Channel";

describe(`createGuildChannel`, () => {
  const expected = mockRequest.post(`/guilds/:guild/channels`, channelSchema);
  const config = generateMock(createGuildChannelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.createGuildChannel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(createGuildChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
