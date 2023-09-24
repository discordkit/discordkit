import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  followNewsChannel,
  followNewsChannelProcedure,
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
    await expect(
      runProcedure(followNewsChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(followNewsChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
