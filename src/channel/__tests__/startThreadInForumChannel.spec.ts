import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  startThreadInForumChannel,
  startThreadInForumChannelSchema
} from "../startThreadInForumChannel";
import { channelSchema } from "../types/Channel";

describe(`startThreadInForumChannel`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/threads`,
    channelSchema
  );
  const config = generateMock(startThreadInForumChannelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.startThreadInForumChannel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(startThreadInForumChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
