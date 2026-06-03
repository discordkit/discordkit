import { toValidated } from "@discordkit/core/requests/toValidated";
import * as v from "valibot";
import { mockUtils } from "#mocks";
import { messageSchema } from "../types/Message.js";
import {
  getChannelMessagesSchema,
  getChannelMessages
} from "../getChannelMessages.js";

describe(`getChannelMessages`, { repeats: 5 }, () => {
  const { config, expected } = mockUtils.request.get(
    `/channels/:channel/messages`,
    getChannelMessagesSchema,
    v.pipe(v.array(messageSchema), v.length(1))
  );

  it(`validates input, fetches, and validates output`, async () => {
    await expect(
      toValidated(
        getChannelMessages,
        getChannelMessagesSchema,
        v.pipe(v.array(messageSchema), v.length(1))
      )(config)
    ).resolves.toEqual(expected);
  });
});
