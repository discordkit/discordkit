import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  getGuildChannelsQuery,
  getGuildChannelsSchema
} from "../getGuildChannels";
import { channelSchema } from "../../channel/types/Channel";

describe(`getGuildChannels`, () => {
  const expected = mockRequest.get(
    `/guilds/:guild/channels`,
    channelSchema.array()
  );
  const config = generateMock(getGuildChannelsSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getGuildChannels(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getGuildChannelsQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
