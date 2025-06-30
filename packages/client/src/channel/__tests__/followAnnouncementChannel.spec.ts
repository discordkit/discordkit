import { waitFor } from "@testing-library/react";
import { mockUtils } from "#mocks";
import { runProcedure, runMutation } from "#test-utils";
import {
  followAnnouncementChannel,
  followAnnouncementChannelProcedure,
  followAnnouncementChannelSafe,
  followAnnouncementChannelSchema
} from "../followAnnouncementChannel.js";
import { followedChannelSchema } from "../types/FollowedChannel.js";

describe(`followAnnouncementChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/followers`,
    followAnnouncementChannelSchema,
    followedChannelSchema
  );

  it(`can be used standalone`, async () => {
    await expect(followAnnouncementChannelSafe(config)).resolves.toEqual(
      expected
    );
  });

  it(`is tRPC compatible`, async () => {
    await expect(
      runProcedure(followAnnouncementChannelProcedure)(config)
    ).resolves.toEqual(expected);
  });

  it(`is react-query compatible`, async () => {
    const { result } = runMutation(followAnnouncementChannel);
    result.current.mutate(config);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expected);
  });
});
