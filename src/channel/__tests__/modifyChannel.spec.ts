import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import { modifyChannel, modifyChannelSchema } from "../modifyChannel";
import { channelSchema } from "../types/Channel";

describe(`modifyChannel`, () => {
  const expected = mockRequest.patch(`/channels/:channel`, channelSchema);
  const config = generateMock(modifyChannelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.modifyChannel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(modifyChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
