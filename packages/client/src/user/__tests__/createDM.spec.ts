import { toValidated } from "@discordkit/core/requests/toValidated";

import { mockUtils } from "#mocks";
import { createDM, createDMSchema } from "../createDM.js";
import { directMessageChannelSchema } from "../../channel/types/Channel.js";

describe(`createDM`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.post(
    `/users/@me/channels`,
    createDMSchema,
    directMessageChannelSchema
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(createDM, createDMSchema, directMessageChannelSchema)(config)
    ).resolves.toEqual(expected);
  });
});
