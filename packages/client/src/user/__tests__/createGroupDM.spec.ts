import { describe, it, expect } from "vite-plus/test";
import { toValidated } from "@discordkit/core/requests/toValidated";
import { mockUtils } from "#mocks";
import { createGroupDM, createGroupDMSchema } from "../createGroupDM.js";
import { groupDirectMessageChannelSchema } from "../../channel/types/Channel.js";

describe(`createGroupDM`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/users/@me/channels`,
    createGroupDMSchema,
    groupDirectMessageChannelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        createGroupDM,
        createGroupDMSchema,
        groupDirectMessageChannelSchema
      )(config)
    ).resolves.toEqual(expected);
  });
});
