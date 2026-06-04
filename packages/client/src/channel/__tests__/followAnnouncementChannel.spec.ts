import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import {
  followAnnouncementChannel,
  followAnnouncementChannelSchema
} from "../followAnnouncementChannel.js";
import { followedChannelSchema } from "../types/FollowedChannel.js";

describe(`followAnnouncementChannel`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/channels/:channel/followers`,
    followAnnouncementChannelSchema,
    followedChannelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        followAnnouncementChannel,
        followAnnouncementChannelSchema,
        followedChannelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
