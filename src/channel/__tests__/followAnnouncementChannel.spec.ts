import { generateMock } from "@anatine/zod-mock";
import { waitFor } from "@testing-library/react";
import {
  runProcedure,
  runMutation,
  mockRequest
} from "../../../scripts/test-utils";
import {
  followAnnouncementChannel,
  followAnnouncementChannelProcedure,
  followAnnouncementChannelSafe,
  followAnnouncementChannelSchema
} from "../followAnnouncementChannel";
import { followedChannelSchema } from "../types/FollowedChannel";

describe(`followAnnouncementChannel`, () => {
  const expected = mockRequest.post(
    `/channels/:channel/followers`,
    followedChannelSchema
  );
  const config = generateMock(followAnnouncementChannelSchema);

  it(`can be used standalone`, async () => {
    await expect(followAnnouncementChannelSafe(config)).resolves.toStrictEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(followAnnouncementChannelProcedure)(config)
    ).resolves.toStrictEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(followAnnouncementChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toStrictEqual(expected);
  });
});
