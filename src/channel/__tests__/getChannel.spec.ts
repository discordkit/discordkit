import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockQuery, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { getChannelQuery, getChannelSchema } from "../getChannel";
import { channelSchema } from "../types/Channel";

describe(`getChannel`, () => {
  const expected = mockRequest.get(`/channels/:channel`, channelSchema);
  const config = generateMock(getChannelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.getChannel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockQuery(getChannelQuery, config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
