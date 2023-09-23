import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import { mockMutation, mockRequest } from "../../../scripts/test-utils";
import { client } from "../__fixtures__/router";
import {
  followNewsChannel,
  followNewsChannelSchema
} from "../followNewsChannel";
import { followedChannelSchema } from "../types/FollowedChannel";

describe(`followNewsChannel`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/followers`,
    followedChannelSchema
  );
  const config = generateMock(followNewsChannelSchema);

  it(`is tRPC compatible`, async () => {
    const actual = await client.followNewsChannel(config);
    expect(actual).toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = mockMutation(followNewsChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
